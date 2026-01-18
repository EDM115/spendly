import type { User } from "~/types"

import db from "@@/server/api/db"

import { hash } from "bcryptjs"
import { randomUUID } from "node:crypto"

const SALT_ROUNDS = 10

export default defineEventHandler(async (event) => {
  if (![ "GET", "POST", "PUT", "DELETE" ].includes(event.method)) {
    throw createError({
      status: 405, message: "Method not allowed",
    })
  }

  switch (event.method) {
    case "GET": {
      const { user_id }: { user_id?: string } = getQuery(event)

      if (user_id) {
        const user = db.prepare<[string], User>(`
          SELECT * FROM User
          WHERE id = ?
        `)
          .get(user_id)

        if (!user) {
          throw createError({
            status: 404,
            message: "User not found",
          })
        }

        return {
          status: 200,
          body: {
            success: "User retrieved",
            user,
          },
        }
      } else {
        const users = db.prepare<[], User>(`
          SELECT * FROM User
        `)
          .all()

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
        username, password, role,
      }: {
        username?: string;
        password?: string;
        role?: string;
      } = await readBody(event)

      if (!username || !role || !password) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userId = randomUUID()
      const hashed = await hash(password, SALT_ROUNDS)

      db.prepare<[string, string, string, string]>(`
        INSERT INTO User (id, username, password, role)
        VALUES (?, ?, ?, ?)
      `)
        .run(userId, username, hashed, role)

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
        id, role,
      }: {
        id?: string; role?: string;
      } = await readBody(event)

      if (!id || !role) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare<[string, string]>(`
        UPDATE User
        SET role = ?
        WHERE id = ?
      `)
        .run(role, id)

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
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare<[string]>(`
        DELETE FROM User
        WHERE id = ?
      `)
        .run(id)

      return {
        status: 200,
        body: {
          success: "User deleted",
        },
      }
    }
    default: {
      throw createError({
        status: 405, message: "Method not allowed",
      })
    }
  }
})
