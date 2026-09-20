import { createHash, randomInt, timingSafeEqual } from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_REQUEST_WINDOW_MS = 15 * 60 * 1000;
const OTP_REQUEST_LIMIT = 5;
const OTP_ATTEMPT_LIMIT = 5;

function hashOtp(email: string, code: string) {
  return createHash("sha256")
    .update(`${process.env.NEXTAUTH_SECRET}:${email}:${code}`)
    .digest("hex");
}

function matchesOtp(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function createEmailOtp(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  const now = new Date();
  const recentCount = await prisma.emailOtp.count({
    where: { email, createdAt: { gte: new Date(now.getTime() - OTP_REQUEST_WINDOW_MS) } }
  });

  if (recentCount >= OTP_REQUEST_LIMIT) return null;

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.emailOtp.create({
    data: {
      email,
      tokenHash: hashOtp(email, code),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS)
    }
  });

  return code;
}

export async function consumeEmailOtp(rawEmail: string, code: string) {
  const email = normalizeEmail(rawEmail);
  const otp = await prisma.emailOtp.findFirst({
    where: { email, consumedAt: null },
    orderBy: { createdAt: "desc" }
  });

  if (!otp || otp.expiresAt <= new Date() || otp.attempts >= OTP_ATTEMPT_LIMIT) return null;

  const codeIsValid = /^\d{6}$/.test(code) && matchesOtp(otp.tokenHash, hashOtp(email, code));
  if (!codeIsValid) {
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return null;
  }

  const consumed = await prisma.emailOtp.updateMany({
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() }
  });
  if (consumed.count !== 1) return null;

  return prisma.user.upsert({
    where: { email },
    update: { emailVerified: new Date() },
    create: {
      email,
      emailVerified: new Date(),
      role: Role.USER,
      wallet: { create: { balance: 0 } }
    }
  });
}
