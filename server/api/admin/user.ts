import db from "@@/server/api/db"

import { hash } from "bcryptjs"

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
        const user = db.prepare(`
          SELECT * FROM User
          WHERE id = ?
        `)
          .get(user_id) as {
            id: number;
            username: string;
            role: string;
          } | undefined

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
        const users = db.prepare(`
          SELECT * FROM User
        `)
          .all() as {
          id: number;
          username: string;
          role: string;
        }[]

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

      const hashed = await hash(password, SALT_ROUNDS)

      const newUser = db.prepare(`
        INSERT INTO User (username, password, role)
        VALUES (?, ?, ?)
      `)
        .run(username, hashed, role)

      return {
        status: 201,
        body: {
          success: "User created",
          id: newUser.lastInsertRowid,
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
