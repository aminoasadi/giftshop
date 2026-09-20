import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getPublicProductBySlug } from "@/lib/catalog";
import { formatCredits, toPersianDigits } from "@/lib/persian";
import { shopConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();
  const image = product.images[0];
  const detailsByCategory = {
    clothing: {
      colors: [["ذغالی", "#2A3036"], ["مشکی", "#0A0C0E"], ["آبی نفتی", "#12314A"]],
      features: ["پارچه مقاوم برای استفاده روزانه", "برش راحت و مناسب استفاده طولانی", "مراقبت آسان با شست‌وشوی ملایم"]
    },
    daily: {
      colors: [["مشکی", "#0A0C0E"], ["استیل", "#A9B6C1"], ["آبی نفتی", "#12314A"]],
      features: ["متریال مقاوم برای استفاده روزمره", "طراحی مینیمال برای میز کار و سفر", "بسته‌بندی مناسب برای هدیه"]
    },
    stationery: {
      colors: [["ذغالی", "#2A3036"], ["مشکی", "#0A0C0E"], ["خاکستری", "#778794"]],
      features: ["کیفیت ساخت مناسب استفاده مداوم", "فرم جمع‌وجور و قابل حمل", "گزینه‌ای کاربردی برای هدیه"]
    }
  } as const;
  const details = detailsByCategory[product.category.slug as keyof typeof detailsByCategory] ?? detailsByCategory.daily;

  return (
    <>
      <SiteHeader />
      <main className="shell pb-20">
        <section className="glass feature-card grid gap-8 p-8 lg:grid-cols-[.9fr_1.1fr]" data-chamfer="br" data-cut="44" data-radius="12" data-fillet="12">
          <div className="product-media feature-card relative min-h-[420px]" data-chamfer="tr" data-cut="30" data-radius="12" data-fillet="10">
            {image ? <Image src={image.url} alt={image.alt} fill className="object-cover" priority /> : null}
          </div>
          <div className="space-y-6">
            <p className="text-sm text-muted">{product.category.name}</p>
            <h1 className="chrome-title text-4xl">{product.name}</h1>
            <div className="space-y-3 border-y border-[#1D466766] py-5">
              <h2 className="text-lg font-bold text-chrome">توضیحات محصول</h2>
              <p className="text-lg text-muted">{product.description}</p>
              <ul className="grid gap-2 text-sm text-muted">
                {details.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="glass-soft feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                <span className="text-sm text-muted">ارزش</span>
                <strong className="block text-xl text-chrome">{formatCredits(product.priceCredits)}</strong>
              </div>
              <div className="glass-soft feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                <span className="text-sm text-muted">موجودی</span>
                <strong className="block text-xl text-chrome">{toPersianDigits(product.stock)}</strong>
              </div>
              <div className="glass-soft feature-card p-4" data-chamfer="tr" data-cut="22" data-radius="12" data-fillet="8">
                <span className="text-sm text-muted">ارسال</span>
                <strong className="block text-base text-chrome">{shopConfig.courierName}</strong>
              </div>
            </div>
            <form action="/api/checkout" method="post" className="checkout-form grid gap-3 bg-[#04101C99] p-4">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="quantity" value="1" />
              <fieldset className="color-picker">
                <legend>رنگ محصول</legend>
                <div className="flex flex-wrap gap-3">
                  {details.colors.map(([name, value], index) => (
                    <label key={name} className="color-option">
                      <input type="radio" name="color" value={name} defaultChecked={index === 0} />
                      <span className="color-swatch" style={{ backgroundColor: value }} aria-hidden="true" />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <input className="input" name="receiverName" placeholder="نام و نام خانوادگی" required />
              <input className="input" name="receiverPhone" placeholder="شماره تماس" required />
              <input className="input" name="postalCode" placeholder="کدپستی" required />
              <textarea className="input min-h-24" name="receiverAddress" placeholder="نشانی کامل" required />
              <input className="input" name="courierNotes" placeholder="توضیحات اختیاری برای پیک" />
              <button className="button" type="submit">
                ثبت سفارش با کیف پول
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
