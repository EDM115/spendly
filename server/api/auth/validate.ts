import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "secret"

export default defineEventHandler((event) => {
  if (event.method !== "GET") {
    throw createError({
      status: 405, message: "Method not allowed",
    })
  }

  const authHeader = event.node.req.headers.authorization

  if (!authHeader) {
    return {
      status: 200,
      body: { valid: false },
    }
  }

  const [ , token ] = authHeader.split(" ")

  try {
    // oxlint-disable-next-line no-unsafe-type-assertion
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number; username: string;
    }

    return {
      status: 200,
      body: {
        valid: true,
        user: {
          id: payload.id,
          username: payload.username,
        },
      },
    }
  } catch {
    return {
      status: 200,
      body: { valid: false },
    }
  }
})
