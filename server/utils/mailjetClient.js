import axios from "axios";

export function getMailjetConfig() {
  return {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET,
    senderEmail: process.env.MAILJET_SENDER_EMAIL,
    senderName: process.env.MAILJET_SENDER_NAME,
  };
}

export async function sendMailjetEmail({ toEmail, toName, subject, html, templateId, variables }) {
  const cfg = getMailjetConfig();
  const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
  const payload = templateId
    ? {
        Messages: [
          {
            From: { Email: cfg.senderEmail, Name: cfg.senderName },
            To: [{ Email: toEmail, Name: toName || toEmail }],
            TemplateID: Number(templateId),
            TemplateLanguage: true,
            Variables: variables || {},
            Subject: subject || undefined,
          },
        ],
      }
    : {
        Messages: [
          {
            From: { Email: cfg.senderEmail, Name: cfg.senderName },
            To: [{ Email: toEmail, Name: toName || toEmail }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      };
  const res = await axios.post("https://api.mailjet.com/v3.1/send", payload, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data;
}
