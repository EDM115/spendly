import db from "#shared/db/drizzle"
import { User } from "#shared/db/schema"

import jwt from "jsonwebtoken"

import { compare } from "bcryptjs"
import { eq } from "drizzle-orm"

const JWT_SECRET = process.env.JWT_SECRET ?? "secret"

export default defineEventHandler(async (event) => {
  if (event.method !== "POST") {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  const {
    username,
    password,
  }: {
    username: string;
    password: string;
  } = await readBody(event)

  const user = await db.select()
    .from(User)
    .where(eq(User.username, username))
    .limit(1)

  if (user.length === 0) {
    throw createError({
      status: 401,
      message: "The user does not exist",
    })
  }

  const passwordMatch = await compare(password, user[0]!.password)

  if (!passwordMatch) {
    throw createError({
      status: 401,
      message: "Invalid password",
    })
  }

  const token = jwt.sign(
    {
      id: user[0]!.id,
      username: user[0]!.username,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  )

  return {
    status: 200,
    body: {
      success: "User connected",
      user: {
        id: user[0]!.id,
        username: user[0]!.username,
        token,
        role: user[0]!.role,
      },
    },
  }
})
