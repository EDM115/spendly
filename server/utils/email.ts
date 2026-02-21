import type { H3Event } from "h3"

import { Resend } from "resend"

import { logger } from "#server/utils/logger"
import { addWide } from "#server/utils/wide"
import { isFeatureDisabled } from "#shared/utils/disabledFeatures"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
  to: string,
  content: {
    template: "spendly-password-reset" | "spendly-verify-email" | "spendly-magic-link" | "spendly-account-deletion" | "spendly-export-request";
    variables: Record<string, string | number>;
    attachments?: {
      filename: string;
      // Base64-encoded content of the attachment
      content: string;
    }[];
  },
  bcc?: string | string[],
  event?: H3Event,
) {
  if (isFeatureDisabled("email")) {
    return
  }

  const bccCount = Array.isArray(bcc)
    ? bcc.length
    : bcc
      ? 1
      : 0
  const attachmentCount = content.attachments?.length ?? 0

  try {
    const {
      data, error,
    } = await resend.emails.send({
      from: "Spendly <spendly@edm115.dev>",
      to: [to],
      bcc,
      template: {
        id: content.template,
        variables: content.variables,
      },
      attachments: content.attachments,
    })

    if (process.env.ALERT_API) {
      await $fetch(`${process.env.ALERT_API}${encodeURIComponent(`[SPENDLY] Email sent to ${to} with template ${content.template}`)}`)
    }

    const emailWide = {
      provider: "resend",
      template: content.template,
      success: !error,
    }

    if (event) {
      addWide(event, {
        email: emailWide,
        meta: {
          email_bcc_count: bccCount,
          email_attachment_count: attachmentCount,
        },
      })
    } else {
      const logPayload = {
        kind: "system",
        op: {
          name: "email.send",
          entity: "email",
        },
        outcome: error
          ? "error"
          : "success",
        email: emailWide,
        meta: {
          email_bcc_count: bccCount,
          email_attachment_count: attachmentCount,
        },
        error: error
          ? {
              type: "email_send_failed",
            }
          : undefined,
      }

      if (error) {
        logger.error(logPayload)
      } else {
        logger.info(logPayload)
      }
    }

    return {
      data,
      error,
    }
  } catch (error) {
    if (event) {
      addWide(event, {
        email: {
          provider: "resend",
          template: content.template,
          success: false,
        },
        meta: {
          email_bcc_count: bccCount,
          email_attachment_count: attachmentCount,
        },
      })
    } else {
      logger.error({
        kind: "system",
        op: {
          name: "email.send",
          entity: "email",
        },
        outcome: "error",
        email: {
          provider: "resend",
          template: content.template,
          success: false,
        },
        meta: {
          email_bcc_count: bccCount,
          email_attachment_count: attachmentCount,
        },
        error: {
          type: "email_send_exception",
        },
      })
    }

    throw error
  }
}

export default sendEmail
