import nodemailer from "nodemailer";

function getTransport() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) throw new Error("SMTP_CONFIG_MISSING");

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass }
  });
}

export async function sendLoginOtp(email: string, code: string) {
  const from = process.env.SMTP_FROM;
  if (!from) throw new Error("SMTP_CONFIG_MISSING");

  await getTransport().sendMail({
    from,
    to: email,
    subject: "کد ورود خانه تکنوکرات‌ها",
    text: `کد ورود شما: ${code}\nاین کد تا پنج دقیقه معتبر است. اگر درخواست ورود نداده‌اید، این ایمیل را نادیده بگیرید.`,
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#071A2C"><h1 style="font-size:24px">خانه تکنوکرات‌ها</h1><p>کد ورود شما:</p><p style="font-size:36px;font-weight:700;letter-spacing:4px">${code}</p><p>این کد تا پنج دقیقه معتبر است. اگر درخواست ورود نداده‌اید، این ایمیل را نادیده بگیرید.</p></div>`
  });
}
