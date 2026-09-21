import Link from "next/link";
import { LayoutDashboard, ShieldCheck, ShoppingBag } from "lucide-react";
import { RechargeDialog } from "@/components/recharge-dialog";
import { shopConfig } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="shell site-header">
      <Link href="/" className="wordmark">
        <span className="wordmark-title" aria-label={shopConfig.brandName}>
          <small>خانه</small>
          <strong>تکنوکرات‌ها</strong>
        </span>
      </Link>
      <nav className="site-nav">
        <Link href="/products">محصولات</Link>
        <Link href="/terms">قوانین اعتبار</Link>
        <Link href="/dashboard">داشبورد</Link>
      </nav>
      <RechargeDialog />
    </header>
  );
}

export function QuickActions() {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Link className="surface-tile feature-card p-5" href="/dashboard" data-chamfer="tr" data-cut="24" data-radius="12" data-fillet="9">
        <LayoutDashboard className="mb-3" size={22} />
        <strong className="block text-chrome">شارژ کیف پول</strong>
        <span className="text-sm text-muted">کد فیزیکی را در پروفایل وارد کنید.</span>
      </Link>
      <Link className="surface-tile feature-card p-5" href="/products" data-chamfer="tr" data-cut="24" data-radius="12" data-fillet="9">
        <ShoppingBag className="mb-3" size={22} />
        <strong className="block text-chrome">انتخاب محصول</strong>
        <span className="text-sm text-muted">پرداخت فقط با اعتبار کیف پول انجام می‌شود.</span>
      </Link>
      <Link className="surface-tile feature-card p-5" href="/terms" data-chamfer="tr" data-cut="24" data-radius="12" data-fillet="9">
        <ShieldCheck className="mb-3" size={22} />
        <strong className="block text-chrome">ارسال رایگان</strong>
        <span className="text-sm text-muted">تحویل با پیک ویژه خانه تکنوکرات‌ها.</span>
      </Link>
    </div>
  );
}
