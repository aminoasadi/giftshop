import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCredits, toPersianDigits } from "@/lib/persian";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { charged?: string; error?: string; order?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const params = searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallet: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 12 },
      orders: { orderBy: { createdAt: "desc" }, take: 8, include: { items: { include: { product: true } } } },
      addresses: true
    }
  });

  return (
    <>
      <SiteHeader />
      <main className="shell grid gap-6 pb-20 lg:grid-cols-[.85fr_1.15fr]">
        <section className="glass feature-card p-8" data-chamfer="br" data-cut="40" data-radius="12" data-fillet="12">
          <p className="text-sm text-muted">کیف پول</p>
          <h1 className="chrome-title text-4xl">{formatCredits(user?.wallet?.balance ?? 0)}</h1>
          <form action="/api/recharge/redeem" method="post" className="mt-8 grid gap-3">
            <label className="text-sm text-muted" htmlFor="code">
              کد شارژ پنج‌کاراکتری
            </label>
            <input className="input text-left" dir="ltr" id="code" name="code" maxLength={6} placeholder="A1B2C" required />
            <button className="button" type="submit">
              شارژ کیف پول
            </button>
          </form>
          {params.charged ? <p className="mt-4 rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-100">کیف پول با {formatCredits(Number(params.charged))} شارژ شد.</p> : null}
          {params.error ? <p className="mt-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-100">{params.error}</p> : null}
          {params.order ? <p className="mt-4 rounded-lg bg-emerald-950/50 p-3 text-sm text-emerald-100">سفارش ثبت شد و در انتظار بررسی است.</p> : null}
        </section>

        <section className="grid gap-6">
          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-chrome">تراکنش‌ها</h2>
              <span className="text-sm text-muted">{toPersianDigits(user?.transactions.length ?? 0)} مورد اخیر</span>
            </div>
            <div className="grid gap-2">
              {user?.transactions.map((transaction) => (
                <div key={transaction.id} className="dashboard-row grid gap-1 bg-[#04101C99] p-4 sm:grid-cols-3">
                  <span className="text-chrome">{transaction.reason ?? transaction.type}</span>
                  <span className={transaction.amount >= 0 ? "text-emerald-100" : "text-red-100"}>{formatCredits(transaction.amount)}</span>
                  <span className="text-sm text-muted">مانده: {formatCredits(transaction.balanceAfter)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">سفارش‌ها</h2>
            <div className="grid gap-2">
              {user?.orders.map((order) => (
                <div key={order.id} className="dashboard-row bg-[#04101C99] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <strong className="text-chrome">{formatCredits(order.totalCredits)}</strong>
                    <span className="text-sm text-muted">{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{order.items.map((item) => item.product.name).join("، ")}</p>
                </div>
              ))}
              {!user?.orders.length ? (
                <Link className="button secondary" href="/products">
                  هنوز سفارشی ندارید؛ محصول‌ها را ببینید.
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
