import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { publicUrl } from "@/lib/http";
import { checkoutWithWallet } from "@/lib/services/orders";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(10),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(8),
  receiverAddress: z.string().min(8),
  postalCode: z.string().min(5),
  courierNotes: z.string().optional()
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.redirect(publicUrl(request, "/login"), { status: 303 });

  const contentType = request.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await request.json() : Object.fromEntries(await request.formData());
  const parsed = checkoutSchema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ message: "اطلاعات سفارش کامل نیست." }, { status: 400 });

  try {
    const order = await checkoutWithWallet({ ...parsed.data, userId: session.user.id });
    if (contentType.includes("application/json")) return NextResponse.json(order);
    return NextResponse.redirect(publicUrl(request, `/dashboard?order=${order.id}`), { status: 303 });
  } catch (error) {
    const message = error instanceof Error && error.message === "INSUFFICIENT_BALANCE" ? "اعتبار کیف پول کافی نیست." : "ثبت سفارش انجام نشد.";
    if (contentType.includes("application/json")) return NextResponse.json({ message }, { status: 400 });
    return NextResponse.redirect(publicUrl(request, `/dashboard?error=${encodeURIComponent(message)}`), { status: 303 });
  }
}
