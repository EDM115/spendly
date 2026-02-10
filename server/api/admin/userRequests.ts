import { db } from "#shared/db/drizzle"
import {
	user,
	user_requests,
} from "#shared/db/schema"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import {
	desc,
	eq,
} from "drizzle-orm"

export default defineEventHandler(async (event) => {
	if (event.method !== "GET") {
		throw createError({
			status: 405,
			message: "Method not allowed",
		})
	}

	const auth = event.context.auth

	requireUserId(auth)

	if (auth?.role !== "admin") {
		throw createError({
			status: 403,
			message: "Admin access required",
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
		.orderBy(desc(user_requests.request_date))

	addWide(event, {
		op: {
			name: "admin.userRequest.list",
			entity: "userRequest",
			count: requests.length,
		},
	})

	return {
		status: 200,
		body: {
			success: "User requests retrieved",
			requests,
		},
	}
})
