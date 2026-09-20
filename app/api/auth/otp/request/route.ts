import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLoginOtp } from "@/lib/email";
import { createEmailOtp, normalizeEmail } from "@/lib/otp";

export const runtime = "nodejs";

const inputSchema = z.object({ email: z.string().trim().email().max(254) });

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "ایمیل معتبر وارد کنید." }, { status: 400 });

  const email = normalizeEmail(parsed.data.email);
  let code: string | null;
  try {
    code = await createEmailOtp(email);
  } catch (error) {
    console.error("OTP storage failed", error);
    return NextResponse.json({ message: "سامانهٔ ورود موقتاً در دسترس نیست." }, { status: 503 });
  }
  if (!code) {
    return NextResponse.json({ message: "تعداد درخواست‌ها زیاد است. چند دقیقه دیگر دوباره تلاش کنید." }, { status: 429 });
  }

  try {
    await sendLoginOtp(email, code);
  } catch (error) {
    console.error("OTP email delivery failed", error);
    return NextResponse.json({ message: "ارسال کد انجام نشد. تنظیمات ایمیل را بررسی کنید." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
