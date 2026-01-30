import db from "#shared/db/drizzle"
import { User } from "#shared/db/schema"

import { hash } from "bcryptjs"
import { eq } from "drizzle-orm"
import { randomUUID } from "node:crypto"

const SALT_ROUNDS = 10

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST", "PUT", "DELETE" ].includes(event.method)) {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  switch (event.method) {
    case "GET": {
      const { user_id }: { user_id?: string } = getQuery(event)

      if (user_id) {
        const user = await db.select()
          .from(User)
          .where(eq(User.id, user_id))
          .limit(1)

        if (user.length === 0) {
          throw createError({
            status: 404,
            message: "User not found",
          })
        }

        return {
          status: 200,
          body: {
            success: "User retrieved",
            user: user[0]!,
          },
        }
      } else {
        const users = await db.select()
          .from(User)

        return {
          status: 200,
          body: {
            success: "Users retrieved",
            users,
          },
        }
      }
    }
    case "POST": {
      const {
        username,
        password,
        role,
      }: {
        username?: string;
        password?: string;
        role?: UserType;
      } = await readBody(event)

      if (!username || !role || !password) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      const userId = randomUUID()
      const hashed = await hash(password, SALT_ROUNDS)

      await db.insert(User)
        .values({
          id: userId,
          username,
          password: hashed,
          role,
        })

      return {
        status: 201,
        body: {
          success: "User created",
          id: userId,
        },
      }
    }
    case "PUT": {
      const {
        id,
        role,
      }: {
        id?: string;
        role?: UserType;
      } = await readBody(event)

      if (!id || !role) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      await db.update(User)
        .set({ role })
        .where(eq(User.id, id))

      return {
        status: 200,
        body: {
          success: "User updated",
        },
      }
    }
    case "DELETE": {
      const { id }: { id?: string } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400,
          message: "Missing required fields",
        })
      }

      await db.delete(User)
        .where(eq(User.id, id))

      return {
        status: 200,
        body: {
          success: "User deleted",
        },
      }
    }
    default: {
      throw createError({
        status: 405,
        message: "Method not allowed",
      })
    }
  }
})
