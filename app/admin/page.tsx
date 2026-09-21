import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { OrderStatus, RechargeCodeStatus, Role, WalletTransactionType } from "@prisma/client";
import { SiteHeader } from "@/components/site-header";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCredits, toPersianDigits } from "@/lib/persian";
import { adjustUserCreditAction, createProductAction, createRechargeCodeAction, updateOrderStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  "code-created": "کد شارژ ساخته شد.",
  "code-failed": "ساخت کد انجام نشد. کد باید پنج کاراکتر انگلیسی یا عددی و تکراری نباشد.",
  "credit-updated": "اعتبار کاربر به‌روزرسانی شد.",
  "credit-failed": "تغییر اعتبار انجام نشد. ایمیل کاربر و مقدار اعتبار را بررسی کنید.",
  "product-created": "محصول جدید روی سایت منتشر شد.",
  "product-failed": "ثبت محصول انجام نشد. اسلاگ لاتین، دسته‌بندی و تصویر را بررسی کنید.",
  "order-updated": "وضعیت سفارش تغییر کرد.",
  "order-failed": "تغییر وضعیت سفارش انجام نشد."
};

const orderLabels: Record<OrderStatus, string> = {
  PENDING_REVIEW: "در انتظار بررسی",
  PREPARING: "در حال آماده‌سازی",
  HANDED_TO_COURIER: "تحویل پیک",
  DELIVERED: "تحویل‌شده",
  CANCELED: "لغوشده"
};

const codeLabels: Record<RechargeCodeStatus, string> = {
  ACTIVE: "فعال",
  USED: "مصرف‌شده",
  EXPIRED: "منقضی",
  DISABLED: "غیرفعال"
};

function persianDate(value: Date) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export default async function AdminPage({ searchParams }: { searchParams: { notice?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?next=/admin");
  if (session.user.role !== Role.ADMIN) redirect("/dashboard");

  const [users, orders, products, pendingOrders, charged, rechargeCodes, recentOrders, recentUsers, categories] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.order.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.walletTransaction.aggregate({ where: { type: WalletTransactionType.RECHARGE_CODE }, _sum: { amount: true } }),
    prisma.rechargeCode.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { usedBy: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { user: true, items: { include: { product: true } } }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { wallet: true, _count: { select: { orders: true, transactions: true } } }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <>
      <SiteHeader />
      <main className="shell admin-page pb-20">
        <section className="glass feature-card p-8" data-chamfer="br" data-cut="40" data-radius="12" data-fillet="12">
          <p className="text-sm text-muted">پنل محافظت‌شده ادمین</p>
          <h1 className="chrome-title text-4xl">داشبورد مدیریت فروشگاه</h1>
          {searchParams.notice && notices[searchParams.notice] ? <p className="admin-notice mt-6">{notices[searchParams.notice]}</p> : null}
          <div className="mt-8 grid gap-2 md:grid-cols-5">
            {[
              ["کاربران", toPersianDigits(users)],
              ["سفارش‌ها", toPersianDigits(orders)],
              ["اعتبار شارژشده", formatCredits(charged._sum.amount ?? 0)],
              ["محصولات", toPersianDigits(products)],
              ["در انتظار بررسی", toPersianDigits(pendingOrders)]
            ].map(([label, value]) => (
              <div key={label} className="glass-soft feature-card p-4" data-chamfer="br" data-cut="22" data-radius="12" data-fillet="8">
                <span className="text-sm text-muted">{label}</span>
                <strong className="block text-xl text-chrome">{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <form action={createRechargeCodeAction} className="glass-soft feature-card admin-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="text-2xl font-extrabold text-chrome">ساخت کد شارژ</h2>
            <p className="text-sm text-muted">کد پنج‌کاراکتری شامل حروف انگلیسی و عدد.</p>
            <label className="login-field">
              <span>کد</span>
              <input className="input text-left" dir="ltr" name="code" maxLength={5} pattern="[A-Za-z0-9]{5}" placeholder="A1B2C" required />
            </label>
            <label className="login-field">
              <span>ارزش اعتبار</span>
              <input className="input" inputMode="numeric" name="valueCredits" placeholder="500" required />
            </label>
            <label className="login-field">
              <span>تاریخ انقضا، اختیاری</span>
              <input className="input text-left" dir="ltr" name="expiresAt" type="date" />
            </label>
            <button className="button" type="submit">ثبت کد</button>
          </form>

          <form action={adjustUserCreditAction} className="glass-soft feature-card admin-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="text-2xl font-extrabold text-chrome">اعتبار دستی</h2>
            <p className="text-sm text-muted">با ایمیل کاربر، اعتبار اضافه یا کم کنید.</p>
            <label className="login-field">
              <span>ایمیل کاربر</span>
              <input className="input text-left" dir="ltr" name="email" type="email" placeholder="user@example.com" required />
            </label>
            <label className="login-field">
              <span>مقدار اعتبار</span>
              <input className="input" name="amount" placeholder="مثلاً 250 یا -100" required />
            </label>
            <label className="login-field">
              <span>دلیل</span>
              <input className="input" name="reason" placeholder="شارژ دستی توسط پشتیبانی" />
            </label>
            <button className="button" type="submit">ثبت تغییر اعتبار</button>
          </form>

          <form action={createProductAction} className="glass-soft feature-card admin-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="text-2xl font-extrabold text-chrome">افزودن محصول</h2>
            <p className="text-sm text-muted">محصول پس از ثبت، در فروشگاه نمایش داده می‌شود.</p>
            <label className="login-field">
              <span>نام محصول</span>
              <input className="input" name="name" required />
            </label>
            <label className="login-field">
              <span>اسلاگ لاتین</span>
              <input className="input text-left" dir="ltr" name="slug" placeholder="new-product" required />
            </label>
            <label className="login-field">
              <span>دسته‌بندی موجود</span>
              <select className="input" name="categoryId" defaultValue="">
                <option value="">دسته‌بندی تازه می‌سازم</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="login-field">
                <span>دسته‌بندی تازه</span>
                <input className="input" name="categoryName" placeholder="مثلاً گجت" />
              </label>
              <label className="login-field">
                <span>اسلاگ دسته</span>
                <input className="input text-left" dir="ltr" name="categorySlug" placeholder="gadgets" />
              </label>
            </div>
            <textarea className="input min-h-24" name="description" placeholder="توضیحات محصول" required />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input" name="priceCredits" placeholder="ارزش اعتباری" required />
              <input className="input" name="stock" placeholder="موجودی" required />
            </div>
            <input className="input text-left" dir="ltr" name="imageUrl" placeholder="/products/new-product.png یا URL تصویر" required />
            <input className="input" name="imageAlt" placeholder="متن جایگزین تصویر" required />
            <button className="button" type="submit">انتشار محصول</button>
          </form>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">سفارش‌های اخیر</h2>
            <div className="grid gap-3">
              {recentOrders.map((order) => (
                <article key={order.id} className="dashboard-row admin-order bg-[#04101C99] p-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-chrome">{order.user.name ?? order.user.email}</strong>
                      <span className="text-sm text-muted">{orderLabels[order.status]}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted">{order.user.email}، {persianDate(order.createdAt)}</p>
                  </div>
                  <div className="grid gap-2 text-sm text-muted md:grid-cols-2">
                    <p>محصول: {order.items.map((item) => `${item.product.name} × ${toPersianDigits(item.quantity)}`).join("، ")}</p>
                    <p>ارزش: {formatCredits(order.totalCredits)}</p>
                    <p>گیرنده: {order.receiverName}، {order.receiverPhone}</p>
                    <p>کدپستی: {order.postalCode}</p>
                    <p className="md:col-span-2">آدرس: {order.receiverAddress}</p>
                    {order.courierNotes ? <p className="md:col-span-2">توضیح پیک: {order.courierNotes}</p> : null}
                  </div>
                  <form action={updateOrderStatusAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select className="input" name="status" defaultValue={order.status}>
                      {Object.entries(orderLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <button className="button secondary" type="submit">به‌روزرسانی</button>
                  </form>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">کاربران</h2>
            <div className="grid gap-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="dashboard-row bg-[#04101C99] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <strong className="text-chrome">{user.name ?? "بدون نام"}</strong>
                    <span className="text-sm text-muted">{user.role === Role.ADMIN ? "ادمین" : "کاربر"}</span>
                  </div>
                  <bdi className="mt-2 block text-sm text-muted">{user.email}</bdi>
                  <p className="mt-2 text-sm text-muted">
                    مانده: {formatCredits(user.wallet?.balance ?? 0)}، سفارش‌ها: {toPersianDigits(user._count.orders)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">کدهای شارژ اخیر</h2>
            <div className="grid gap-2">
              {rechargeCodes.map((code) => (
                <div key={code.id} className="dashboard-row bg-[#04101C99] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <bdi className="text-chrome">{code.code}</bdi>
                    <span className="text-sm text-muted">{codeLabels[code.status]}</span>
                  </div>
                  <p className="text-sm text-muted">
                    {formatCredits(code.valueCredits)} {code.usedBy ? `، مصرف توسط ${code.usedBy.name ?? code.usedBy.email}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-soft feature-card p-6" data-chamfer="br" data-cut="32" data-radius="12" data-fillet="10">
            <h2 className="mb-5 text-2xl font-extrabold text-chrome">دسترسی ادمین</h2>
            <div className="dashboard-row bg-[#04101C99] p-4 text-sm text-muted">
              <p>مسیر پنل: <bdi className="text-chrome">/admin</bdi></p>
              <p className="mt-2">برای ساخت ادمین، مقدارهای <bdi>ADMIN_EMAIL</bdi> و <bdi>ADMIN_PASSWORD</bdi> را در محیط سرور بگذارید و seed را اجرا کنید.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
