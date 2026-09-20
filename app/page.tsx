import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BadgeCheck, CreditCard, Radar, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { shopConfig } from "@/lib/config";
import { getPublicProducts } from "@/lib/catalog";
import { formatCredits } from "@/lib/persian";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getPublicProducts();

  return (
    <>
      <SiteHeader />
      <main className="shell pb-20">
        <section className="glass hero hero-store" data-chamfer="br" data-cut="56" data-radius="12" data-fillet="12">
          <div className="hero-copy-panel relative z-10 flex flex-col justify-center gap-8 p-8 md:p-14">
            <span className="eyebrow">فروشگاه اعتبارمحور برای هدیه‌های فیزیکی</span>
            <h1 className="max-w-3xl text-[34px] font-normal leading-[1.75] text-chrome md:text-[50px]">
              {shopConfig.brandName} برای تبدیل کارت هدیه به خرید واقعی.
            </h1>
            <p className="max-w-2xl text-lg text-muted">
              کد شارژ روی کارت یا اسکناس را وارد کنید، اعتبار کیف پول بالا می‌رود و محصول دلخواه با همان اعتبار ثبت سفارش می‌شود.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="button" href="/dashboard">
                شارژ کیف پول
                <ArrowLeft size={18} />
              </Link>
              <Link className="button secondary" href="/products">
                مشاهده فروشگاه
              </Link>
            </div>
            <div className="grid max-w-2xl gap-2 sm:grid-cols-3">
              {[
                ["کد ۵ یا ۶ رقمی", "ورودی فارسی و انگلیسی"],
                ["پرداخت اعتباری", "بدون پرداخت نقدی"],
                ["ارسال رایگان", shopConfig.courierName]
              ].map(([title, desc]) => (
                <div key={title} className="surface-tile feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                  <strong className="block text-chrome">{title}</strong>
                  <span className="text-xs text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-gift-panel relative z-10 flex items-center justify-center p-8 md:p-14">
            <Image
              src="/hero-credit-gift.png"
              alt="جعبه هدیه همراه کارت اعتبار برای خرید از خانه تکنوکرات‌ها"
              width={1024}
              height={1024}
              priority
              className="hero-credit-visual"
            />
          </div>
        </section>

        <section className="grid gap-[6px] py-7 md:grid-cols-4">
          {[
            ["کدهای شارژ", "۵ یا ۶ رقمی، یکتا و یک‌بارمصرف", BadgeCheck],
            ["پرداخت", "فقط با موجودی کیف پول", CreditCard],
            ["ارسال", shopConfig.courierName, Truck],
            ["نمونه ارزش", formatCredits(300), Radar]
          ].map(([title, desc, Icon]) => (
            <div key={title as string} className="surface-tile feature-card p-6" data-chamfer="tr" data-cut="24" data-radius="12" data-fillet="9">
              <Icon className="mb-4 text-chrome" size={24} />
              <strong className="block text-lg text-chrome">{title as string}</strong>
              <span className="text-sm text-muted">{desc as string}</span>
            </div>
          ))}
        </section>

        <section className="section-block pt-12 md:pt-16">
          <div className="section-heading">
            <div>
              <span className="eyebrow">همه محصولات</span>
              <h2 className="chrome-title text-3xl leading-[1.65] md:text-[42px]">هدیه‌هایی که با اعتبار خریداری می‌شوند</h2>
            </div>
          </div>
          <div className="store-grid md:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="glass-soft feature-card purchase-guide p-8 md:p-10" data-chamfer="tr" data-cut="34" data-radius="12" data-fillet="10">
            <div className="purchase-guide-intro">
              <span className="eyebrow">فرایند خرید</span>
              <h2 className="chrome-title text-3xl leading-[1.65] md:text-[42px]">از کد فیزیکی تا ثبت سفارش</h2>
              <p className="mt-4 max-w-sm text-muted">هر مرحله از حساب کاربری قابل پیگیری است.</p>
              <Link className="button secondary mt-7" href="/dashboard">
                ورود به داشبورد
                <ArrowLeft size={18} />
              </Link>
            </div>
            <ol className="purchase-steps">
              {[
                ["۰۱", "ورود یا ثبت‌نام", "حساب کاربری، کیف پول و نشانی ارسال آماده می‌شود."],
                ["۰۲", "شارژ با کد", "کد ۵ یا ۶ رقمی بررسی می‌شود و اعتبار فقط از دیتابیس خوانده می‌شود."],
                ["۰۳", "خرید محصول", "اگر موجودی کافی باشد، سفارش و کسر اعتبار هم‌زمان ثبت می‌شود."]
              ].map(([number, title, desc]) => (
                <li key={number}>
                  <span className="purchase-step-number">{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-block">
          <div className="glass house-cta grid gap-8 p-8 md:grid-cols-[1.2fr_.8fr] md:p-10" data-chamfer="br" data-cut="44" data-radius="12" data-fillet="12">
            <div>
              <span className="eyebrow">آماده خرید هستید؟</span>
              <h2 className="chrome-title text-3xl leading-[1.65] md:text-[42px]">کارت هدیه را بردارید و موجودی کیف پول را شارژ کنید.</h2>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <Link className="button" href="/dashboard">
                ورود به داشبورد
                <ArrowLeft size={18} />
              </Link>
              <Link className="button secondary" href="/terms">
                قوانین اعتبار
                <ShieldCheck size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
