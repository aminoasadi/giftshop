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

export async function getPublicProducts(query: ProductQuery = {}): Promise<PublicProduct[]> {
  if (shouldUseDemoCatalog()) return filterDemoProducts(query);

  try {
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
  } catch {
    return filterDemoProducts(query);
  }
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  if (shouldUseDemoCatalog()) return demoCategories;

  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return demoCategories;
  }
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  if (shouldUseDemoCatalog()) return demoProducts.find((product) => product.slug === slug) ?? null;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true, category: true }
    });
    if (!product || !product.isActive || product.deletedAt) return null;
    return product;
  } catch {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }
}
