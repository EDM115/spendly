import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, body: string | Record<string, unknown>, template?: string) {
  // ...
  /*
  const { data, error } = await resend.emails.send({
    from: 'Spendly <spendly@edm115.dev>',
    to: [to],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });
  
  if (error) {
    console.error({ error });
  } else {
    console.log({ data });
  }
  */
}

export default sendEmail
