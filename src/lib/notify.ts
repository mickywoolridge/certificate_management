import type { Certificate } from "@prisma/client";
import { formatNoticePeriod } from "./notice";

type SendResult = { ok: true } | { ok: false; error: string };
type NotifiableObject = Certificate & { objectType: { name: string } };

export async function sendNoticeEntryEmail(cert: NotifiableObject, appUrl: string): Promise<SendResult> {
  const subject = `[${cert.objectType.name}] "${cert.name}" entered its notice period`;
  const body = [
    `Object type: ${cert.objectType.name}`,
    `Item: ${cert.name}`,
    `System: ${cert.system}`,
    `Owner: ${cert.ownerName}`,
    `Expires: ${cert.endDate.toISOString().slice(0, 10)}`,
    `Notice period: ${formatNoticePeriod(cert.noticeQuantity, cert.noticeUnit)} before expiry`,
    cert.description ? `Notes: ${cert.description}` : null,
    "",
    `Open dashboard: ${appUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (resendKey && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [cert.ownerEmail],
        subject,
        text: body,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Resend: ${res.status} ${errText}` };
    }
    return { ok: true };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[notify:skipped] Would email", cert.ownerEmail, "\n", subject, "\n", body);
    return { ok: true };
  }

  return {
    ok: false,
    error: "Configure RESEND_API_KEY and EMAIL_FROM to send email, or run in development to log only.",
  };
}
