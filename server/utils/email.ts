import { Resend } from "resend"

const _resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
  _to: string,
  _subject: string,
  _body: string | Record<string, unknown>,
  _template?: string,
) {
  // ...
  /*
  Implementation notes for wide events (when Resend is wired) :
  Do NOT log `to`, `subject`, or `body` contents (avoid PII/sensitive data).
  Instead, enrich the request-wide event with:
  - op.name = "email.send"
  - email.provider = "resend"
  - email.template = template ?? "inline"
  - email.success = true/false
  Prefer internal user IDs from the request context, not email addresses.
  If this function is called outside a request context, consider accepting an optional `event` parameter to add fields via `addWide(event, ...)`.
  */

  /*
  Implementation notes for user export / deletion requests:
  - Export emails should include the generated ZIP as attachment.
  - Primary recipient is the account email (user.email).
  - Use Better Auth accountInfo to collect OAuth provider emails.
  - Add provider emails as CCI if different from primary email.
  - Never log the email addresses, only counts (cci_count) in wide events.
  */

  /*
  const { data, error } = await resend.emails.send({
    from: 'Spendly <spendly@edm115.dev>',
    to: [to],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  })

  if (error) {
    console.error({ error })
  } else {
    console.log({ data })
  }
  */
}

export default sendEmail
