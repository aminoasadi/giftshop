"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { OrderStatus, RechargeCodeStatus, Role, WalletTransactionType } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { normalizeRechargeCode } from "@/lib/persian";
import { prisma } from "@/lib/prisma";

const noticePath = {
  codeCreated: "/admin?notice=code-created",
  codeFailed: "/admin?notice=code-failed",
  creditUpdated: "/admin?notice=credit-updated",
  creditFailed: "/admin?notice=credit-failed",
  productCreated: "/admin?notice=product-created",
  productFailed: "/admin?notice=product-failed",
  orderUpdated: "/admin?notice=order-updated",
  orderFailed: "/admin?notice=order-failed"
} as const;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/admin");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");
  return session.user.id;
}

function stringValue(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() ?? "";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createRechargeCodeAction(formData: FormData) {
  const adminId = await requireAdmin();
  const code = normalizeRechargeCode(stringValue(formData, "code"));
  const valueCredits = Number(stringValue(formData, "valueCredits"));
  const expiresAtValue = stringValue(formData, "expiresAt");

  const parsed = z.object({
    code: z.string().regex(/^[A-Z0-9]{5}$/),
    valueCredits: z.number().int().positive().max(1_000_000),
    expiresAt: z.date().optional()
  }).safeParse({
    code,
    valueCredits,
    expiresAt: expiresAtValue ? new Date(`${expiresAtValue}T23:59:59`) : undefined
  });

  if (!parsed.success) redirect(noticePath.codeFailed);

  try {
    await prisma.rechargeCode.create({
      data: {
        code: parsed.data.code,
        valueCredits: parsed.data.valueCredits,
        expiresAt: parsed.data.expiresAt
      }
    });
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "RECHARGE_CODE_CREATED",
        target: parsed.data.code,
        metadata: { valueCredits: parsed.data.valueCredits }
      }
    });
  } catch {
    redirect(noticePath.codeFailed);
  }

  revalidatePath("/admin");
  redirect(noticePath.codeCreated);
}

export async function adjustUserCreditAction(formData: FormData) {
  const adminId = await requireAdmin();
  const email = stringValue(formData, "email").toLowerCase();
  const amount = Number(stringValue(formData, "amount"));
  const reason = stringValue(formData, "reason") || "تغییر دستی اعتبار توسط ادمین";

  const parsed = z.object({
    email: z.string().email(),
    amount: z.number().int().refine((value) => value !== 0),
    reason: z.string().min(2).max(180)
  }).safeParse({ email, amount, reason });

  if (!parsed.success) redirect(noticePath.creditFailed);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { email: parsed.data.email }, include: { wallet: true } });
      if (!user) throw new Error("USER_NOT_FOUND");

      const wallet = await tx.wallet.upsert({
        where: { userId: user.id },
        update: { balance: { increment: parsed.data.amount } },
        create: { userId: user.id, balance: parsed.data.amount }
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: parsed.data.amount,
          balanceAfter: wallet.balance,
          type: parsed.data.amount > 0 ? WalletTransactionType.ADMIN_INCREASE : WalletTransactionType.ADMIN_DECREASE,
          reason: parsed.data.reason
        }
      });

      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: parsed.data.amount > 0 ? "ADMIN_CREDIT_INCREASED" : "ADMIN_CREDIT_DECREASED",
          target: user.id,
          metadata: { email: user.email, amount: parsed.data.amount, reason: parsed.data.reason }
        }
      });
    });
  } catch {
    redirect(noticePath.creditFailed);
  }

  revalidatePath("/admin");
  redirect(noticePath.creditUpdated);
}

export async function createProductAction(formData: FormData) {
  const adminId = await requireAdmin();
  const categoryId = stringValue(formData, "categoryId");
  const categoryName = stringValue(formData, "categoryName");
  const productSlug = slugify(stringValue(formData, "slug"));
  const categorySlug = slugify(stringValue(formData, "categorySlug") || categoryName);

  const parsed = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(8).max(700),
    priceCredits: z.coerce.number().int().positive().max(1_000_000),
    stock: z.coerce.number().int().min(0).max(100_000),
    imageUrl: z.string().min(1).max(500),
    imageAlt: z.string().min(2).max(140),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),
    categorySlug: z.string().optional()
  }).safeParse({
    name: stringValue(formData, "name"),
    slug: productSlug,
    description: stringValue(formData, "description"),
    priceCredits: stringValue(formData, "priceCredits"),
    stock: stringValue(formData, "stock"),
    imageUrl: stringValue(formData, "imageUrl"),
    imageAlt: stringValue(formData, "imageAlt"),
    categoryId: categoryId || undefined,
    categoryName: categoryName || undefined,
    categorySlug: categorySlug || undefined
  });

  if (!parsed.success || (!parsed.data.categoryId && !parsed.data.categoryName)) redirect(noticePath.productFailed);

  try {
    await prisma.$transaction(async (tx) => {
      const category = parsed.data.categoryId
        ? await tx.category.findUnique({ where: { id: parsed.data.categoryId } })
        : await tx.category.upsert({
            where: { slug: parsed.data.categorySlug ?? parsed.data.slug },
            update: {},
            create: { name: parsed.data.categoryName ?? "دسته‌بندی تازه", slug: parsed.data.categorySlug ?? parsed.data.slug }
          });

      if (!category) throw new Error("CATEGORY_NOT_FOUND");

      const product = await tx.product.create({
        data: {
          categoryId: category.id,
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description,
          priceCredits: parsed.data.priceCredits,
          stock: parsed.data.stock,
          images: { create: { url: parsed.data.imageUrl, alt: parsed.data.imageAlt } }
        }
      });

      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: "PRODUCT_CREATED",
          target: product.id,
          metadata: { slug: product.slug, name: product.name }
        }
      });
    });
  } catch {
    redirect(noticePath.productFailed);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  redirect(noticePath.productCreated);
}

export async function updateOrderStatusAction(formData: FormData) {
  const adminId = await requireAdmin();
  const parsed = z.object({
    orderId: z.string().min(1),
    status: z.nativeEnum(OrderStatus)
  }).safeParse({
    orderId: stringValue(formData, "orderId"),
    status: stringValue(formData, "status")
  });

  if (!parsed.success) redirect(noticePath.orderFailed);

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status }
    });
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "ORDER_STATUS_UPDATED",
        target: parsed.data.orderId,
        metadata: { status: parsed.data.status }
      }
    });
  } catch {
    redirect(noticePath.orderFailed);
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect(noticePath.orderUpdated);
}
