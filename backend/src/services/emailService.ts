import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter =
  env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      })
    : null;

export async function sendMail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.info("Email transport not configured. Skipping email send.", { to, subject });
    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html
  });
}
