import { SiteHeader } from "@/components/site-header";
import { ShieldCheck, WalletCards } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const isAdminLogin = searchParams.next === "/admin";

  return (
    <>
      <SiteHeader />
      <main className="shell login-page pb-20">
        <div className="login-layout">
          <section className="glass-soft feature-card login-intro p-8 md:p-12" data-chamfer="br" data-cut="48" data-radius="12" data-fillet="12">
            <div>
              <span className="eyebrow">خانه تکنوکرات‌ها</span>
              <h1 className="chrome-title text-3xl md:text-4xl">ورود برای خرید با اعتبار</h1>
              <p className="mt-5 max-w-md text-muted">اعتبار سازمانی و سفارش‌های ثبت‌شده را از حساب کاربری‌تان مدیریت کنید.</p>
            </div>
            <div className="login-highlights" aria-label="مزیت‌های حساب کاربری">
              <div>
                <WalletCards size={22} aria-hidden="true" />
                <span>مشاهدهٔ ارزش اعتباری</span>
              </div>
              <div>
                <ShieldCheck size={22} aria-hidden="true" />
                <span>پرداخت امن با اعتبار</span>
              </div>
            </div>
          </section>

          <section className="glass feature-card login-card w-full p-8 md:p-10" data-chamfer="br" data-cut="36" data-radius="12" data-fillet="11">
            <p className="eyebrow">{isAdminLogin ? "ورود ادمین با رمز" : "ورود با کد یک‌بارمصرف"}</p>
            <h2 className="chrome-title mb-7 text-3xl">ورود به حساب کاربری</h2>
            <LoginForm callbackUrl={isAdminLogin ? "/admin" : "/dashboard"} defaultMode={isAdminLogin ? "password" : "otp"} />
          </section>
        </div>
      </main>
    </>
  );
}
