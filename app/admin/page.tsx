import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Role, WalletTransactionType } from "@prisma/client";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCredits, toPersianDigits } from "@/lib/persian";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");

  const [users, orders, products, pendingOrders, charged, rechargeCodes, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.walletTransaction.aggregate({ where: { type: WalletTransactionType.RECHARGE_CODE }, _sum: { amount: true } }),
    prisma.rechargeCode.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { usedBy: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: true, items: { include: { product: true } } } })
  ]);

  return (
    <>
      <SiteHeader />
      <main className="shell pb-20">
        <section className="glass feature-card p-8" data-chamfer="br" data-cut="40" data-radius="12" data-fillet="12">
          <p className="text-sm text-muted">پنل محافظت‌شده ادمین</p>
          <h1 className="chrome-title text-4xl">داشبورد مدیریت فروشگاه</h1>
          <div className="mt-8 grid gap-2 md:grid-cols-5">
            {[
              ["کاربران", toPersianDigits(users)],
              ["سفارش‌ها", toPersianDigits(orders)],
              ["اعتبار شارژشده", formatCredits(charged._sum.amount ?? 0)],
              ["محصولات", toPersianDigits(products)],
              ["در انتظار بررسی", toPersianDigits(pendingOrders)]
            ].map(([label, value]) => (
              <div key={label} className="glass-soft feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                <span className="text-sm text-muted">{label}</span>
                <strong className="block text-xl text-chrome">{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="glass-soft feature-card p-6" data-chamfer="tr" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">کدهای شارژ اخیر</h2>
            <div className="grid gap-2">
              {rechargeCodes.map((code) => (
                <div key={code.id} className="dashboard-row bg-[#04101C99] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <bdi className="text-chrome">{code.code}</bdi>
                    <span className="text-sm text-muted">{code.status}</span>
                  </div>
                  <p className="text-sm text-muted">
                    {formatCredits(code.valueCredits)} {code.usedBy ? `، مصرف توسط ${code.usedBy.name ?? code.usedBy.email}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-soft feature-card p-6" data-chamfer="tr" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">سفارش‌های اخیر</h2>
            <div className="grid gap-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="dashboard-row bg-[#04101C99] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-chrome">{order.user.name ?? order.user.email}</span>
                    <span className="text-sm text-muted">{order.status}</span>
                  </div>
                  <p className="text-sm text-muted">{formatCredits(order.totalCredits)}، {order.receiverPhone}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
