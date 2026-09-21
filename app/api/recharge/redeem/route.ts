import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { publicUrl } from "@/lib/http";
import { redeemRechargeCode } from "@/lib/services/recharge";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "ورود لازم است." }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  const rawCode = contentType.includes("application/json")
    ? ((await request.json()) as { code?: string }).code
    : (await request.formData()).get("code")?.toString();

  const result = await redeemRechargeCode({
    userId: session.user.id,
    rawCode: rawCode ?? "",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  });

  if (contentType.includes("application/json")) {
    return result.ok ? NextResponse.json(result) : NextResponse.json(result, { status: 400 });
  }

  const url = publicUrl(request, "/dashboard");
  url.searchParams.set(result.ok ? "charged" : "error", result.ok ? String(result.amount) : result.message);
  return NextResponse.redirect(url, { status: 303 });
}
