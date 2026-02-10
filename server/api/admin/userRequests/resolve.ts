import { db } from "#shared/db/drizzle"
import {
	user,
	user_requests,
} from "#shared/db/schema"
import { auth } from "#server/utils/auth"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"
import { buildUserExport } from "#server/utils/userExport"

import type { H3Event } from "h3"

import { eq } from "drizzle-orm"

type UserRequestType = "export" | "delete"

const supportedActions = new Set<UserRequestType>([ "export", "delete" ])
const RESOLVE_DELAY_MS = 5000

const buildHeaders = (event: H3Event): Headers => {
	const headers = new Headers()
	const requestHeaders = getRequestHeaders(event)

	for (const [ key, value ] of Object.entries(requestHeaders)) {
		if (typeof value === "string") {
			headers.set(key, value)
		}
	}

	return headers
}

const wait = async (ms: number): Promise<void> => new Promise((resolve) => {
	setTimeout(resolve, ms)
})

export default defineEventHandler(async (event) => {
	if (event.method !== "POST") {
		throw createError({
			status: 405,
			message: "Method not allowed",
		})
	}

	const authContext = event.context.auth

	requireUserId(authContext)

	if (authContext?.role !== "admin") {
		throw createError({
			status: 403,
			message: "Admin access required",
		})
	}

	const {
		requestId,
		action,
	}: {
		requestId?: string;
		action?: UserRequestType;
	} = await readBody(event)

	if (!requestId || !action || !supportedActions.has(action)) {
		throw createError({
			status: 400,
			message: "Missing or invalid request data",
		})
	}

	const requests = await db.select({
		id: user_requests.id,
		type: user_requests.type,
		request_date: user_requests.request_date,
		user_id: user_requests.user_id,
		user_name: user.name,
		user_email: user.email,
		user_username: user.username,
		user_display_username: user.displayUsername,
	})
		.from(user_requests)
		.innerJoin(user, eq(user_requests.user_id, user.id))
		.where(eq(user_requests.id, requestId))
		.limit(1)

	if (requests.length === 0) {
		throw createError({
			status: 404,
			message: "User request not found",
		})
	}

	const request = requests[0]!

	if (request.type !== action) {
		throw createError({
			status: 400,
			message: "Request type mismatch",
		})
	}

	if (action === "export") {
		const exportResult = await buildUserExport(event, request.user_id)
		const cciEmails = exportResult.oauthEmails

		addWide(event, {
			op: {
				name: "admin.userRequest.resolve",
				entity: "userRequest",
				entity_id: request.id,
			},
			meta: {
				request_type: action,
				user_id: request.user_id,
				export_ready: true,
				cci_count: cciEmails.length,
			},
		})

		// TODO(email): Send exportResult.body + exportResult.filename to request.user_email
		// TODO(email): Include oauth emails in CCI (cciEmails). Avoid logging PII.
	} else {
		const headers = buildHeaders(event)

		// Best-effort: call Better Auth admin removal to ensure full cleanup.
		await auth.api.removeUser({
			body: {
				userId: request.user_id,
			},
			headers,
		})

		addWide(event, {
			op: {
				name: "admin.userRequest.resolve",
				entity: "userRequest",
				entity_id: request.id,
			},
			meta: {
				request_type: action,
				user_id: request.user_id,
			},
		})
	}

	event.waitUntil((async () => {
		await wait(RESOLVE_DELAY_MS)
		await db.delete(user_requests)
			.where(eq(user_requests.id, request.id))
	})())

	return {
		status: 200,
		body: {
			success: "User request resolved",
			id: request.id,
			request_date: request.request_date,
			type: request.type,
		},
	}
})
