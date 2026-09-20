import { SiteHeader } from "@/components/site-header";
import { shopConfig } from "@/lib/config";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pb-20">
        <section className="glass feature-card p-8" data-chamfer="br" data-cut="40" data-radius="12" data-fillet="12">
          <p className="text-sm text-muted">قوانین استفاده از اعتبار</p>
          <h1 className="chrome-title mb-8 text-4xl">روش شارژ، خرید و ارسال</h1>
          <div className="grid gap-3 text-body">
            {[
              "هر کد شارژ فقط یک‌بار قابل استفاده است و مقدار اعتبار آن فقط از دیتابیس خوانده می‌شود.",
              "اگر موجودی کیف پول کافی نباشد، سفارش ثبت نمی‌شود و اعتبار منفی نخواهد شد.",
              "هزینه ارسال برای کاربر صفر است و سفارش‌ها با پیک ویژه خانه تکنوکرات‌ها ارسال می‌شوند.",
              "در صورت لغو سفارش، تمام اعتبار مصرف‌شده با تراکنش مستقل به کیف پول بازمی‌گردد.",
              `برای پیگیری سفارش با ${shopConfig.supportPhone} یا ${shopConfig.supportEmail} تماس بگیرید.`
            ].map((item) => (
              <p key={item} className="glass-soft feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                {item}
              </p>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
