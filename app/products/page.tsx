import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getPublicCategories, getPublicProducts } from "@/lib/catalog";

export const revalidate = 120;

export default async function ProductsPage({ searchParams }: { searchParams: { q?: string; category?: string; sort?: string } }) {
  const params = searchParams;
  const [products, categories] = await Promise.all([getPublicProducts(params), getPublicCategories()]);

  return (
    <>
      <SiteHeader />
      <main className="shell pb-20">
        <section className="glass feature-card p-8" data-chamfer="br" data-cut="40" data-radius="12" data-fillet="12">
          <h1 className="chrome-title text-4xl">فهرست محصولات</h1>
          <p className="mt-3 max-w-2xl text-muted">جست‌وجو، دسته‌بندی و مرتب‌سازی برای انتخاب سریع‌تر محصول اعتباری.</p>
          <form className="mt-8 grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
            <input className="input" name="q" defaultValue={params.q} placeholder="جست‌وجوی محصول" />
            <select className="input" name="category" defaultValue={params.category ?? ""}>
              <option value="">همه دسته‌ها</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            <select className="input" name="sort" defaultValue={params.sort ?? ""}>
              <option value="">جدیدترین</option>
              <option value="cheap">کمترین اعتبار</option>
              <option value="expensive">بیشترین اعتبار</option>
            </select>
            <button className="button" type="submit">
              اعمال
            </button>
          </form>
        </section>
        <section className="grid gap-2 py-10 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </main>
    </>
  );
}
