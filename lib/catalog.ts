import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { demoCategories, demoProducts, type PublicCategory, type PublicProduct } from "@/lib/demo-data";

type ProductQuery = {
  q?: string;
  category?: string;
  sort?: string;
  take?: number;
};

function shouldUseDemoCatalog() {
  return !process.env.DATABASE_URL;
}

function sortProducts(products: PublicProduct[], sort?: string) {
  if (sort === "cheap") return [...products].sort((a, b) => a.priceCredits - b.priceCredits);
  if (sort === "expensive") return [...products].sort((a, b) => b.priceCredits - a.priceCredits);
  return products;
}

function filterDemoProducts(query: ProductQuery) {
  const normalizedQuery = query.q?.trim();
  const filtered = demoProducts.filter((product) => {
    const matchesSearch = normalizedQuery ? product.name.includes(normalizedQuery) || product.description.includes(normalizedQuery) : true;
    const matchesCategory = query.category ? product.category.slug === query.category : true;
    return matchesSearch && matchesCategory;
  });
  return sortProducts(filtered, query.sort).slice(0, query.take ?? filtered.length);
}

const getCachedPublicProducts = unstable_cache(
  async (query: ProductQuery) => {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        name: query.q ? { contains: query.q, mode: "insensitive" } : undefined,
        category: query.category ? { slug: query.category } : undefined
      },
      include: { images: true, category: true },
      take: query.take,
      orderBy: query.sort === "cheap" ? { priceCredits: "asc" } : query.sort === "expensive" ? { priceCredits: "desc" } : { createdAt: "desc" }
    });
    return products;
  },
  ["public-products"],
  { revalidate: 120 }
);

const getCachedPublicCategories = unstable_cache(
  async () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["public-categories"],
  { revalidate: 300 }
);

const getCachedPublicProductBySlug = unstable_cache(
  async (slug: string) => {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true }
    });
    if (!product || !product.isActive || product.deletedAt) return null;
    return product;
  },
  ["public-product-by-slug"],
  { revalidate: 300 }
);

export async function getPublicProducts(query: ProductQuery = {}): Promise<PublicProduct[]> {
  if (shouldUseDemoCatalog()) return filterDemoProducts(query);

  try {
    return await getCachedPublicProducts({
      q: query.q?.trim() || undefined,
      category: query.category || undefined,
      sort: query.sort || undefined,
      take: query.take
    });
  } catch {
    return filterDemoProducts(query);
  }
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  if (shouldUseDemoCatalog()) return demoCategories;

  try {
    return await getCachedPublicCategories();
  } catch {
    return demoCategories;
  }
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  if (shouldUseDemoCatalog()) return demoProducts.find((product) => product.slug === slug) ?? null;

  try {
    return await getCachedPublicProductBySlug(slug);
  } catch {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }
}
