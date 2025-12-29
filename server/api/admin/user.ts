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
      const { user_id } = getQuery(event)

      if (user_id) {
        // oxlint-disable-next-line no-unsafe-type-assertion
        const user = db.prepare(`
          SELECT * FROM User
          WHERE id = ?
        `)
          .get(user_id) as User | undefined

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
        // oxlint-disable-next-line no-unsafe-type-assertion
        const users = db.prepare(`
          SELECT * FROM User
        `)
          .all() as User[]

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
      } = await readBody(event)

      if (!username || !role || !password) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      const userId = randomUUID()
      const hashed = await hash(password, SALT_ROUNDS)

      db.prepare(`
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
      } = await readBody(event)

      if (!id || !role) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare(`
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
      const { id } = await readBody(event)

      if (!id) {
        throw createError({
          status: 400, message: "Missing required fields",
        })
      }

      db.prepare(`
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
