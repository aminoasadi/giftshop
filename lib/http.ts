import type { NextRequest } from "next/server";

export function publicUrl(request: NextRequest, path: string) {
  const configuredUrl = process.env.NEXTAUTH_URL;
  if (configuredUrl) return new URL(path, configuredUrl);

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || new URL(request.url).host;
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || new URL(request.url).protocol.replace(":", "");

  return new URL(path, `${protocol}://${host}`);
}
