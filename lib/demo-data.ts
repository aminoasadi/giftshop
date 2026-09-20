export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type PublicProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  priceCredits: number;
  stock: number;
  isActive: boolean;
  deletedAt: Date | null;
  images: Array<{
    id: string;
    productId: string;
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  category: PublicCategory;
};

export const demoCategories: PublicCategory[] = [
  { id: "demo-clothing", name: "پوشاک", slug: "clothing" },
  { id: "demo-daily", name: "لوازم روزمره", slug: "daily" },
  { id: "demo-stationery", name: "نوشت‌افزار", slug: "stationery" }
];

export const demoProducts: PublicProduct[] = [
  {
    id: "demo-tech-shirt",
    categoryId: "demo-clothing",
    name: "تیشرت تکنوکرات",
    slug: "tech-shirt",
    description: "تیشرت پنبه‌ای با چاپ مینیمال برند؛ مناسب استفاده روزمره و رویدادها.",
    priceCredits: 300,
    stock: 24,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-tech-shirt-image", productId: "demo-tech-shirt", url: "/products/tech-shirt-photo.png", alt: "تیشرت مشکی تکنوکرات", sortOrder: 0 }],
    category: demoCategories[0]
  },
  {
    id: "demo-steel-mug",
    categoryId: "demo-daily",
    name: "ماگ استیل",
    slug: "steel-mug",
    description: "ماگ سبک و مقاوم برای میز کار؛ ارسال با پیک ویژه خانه تکنوکرات‌ها.",
    priceCredits: 180,
    stock: 40,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-steel-mug-image", productId: "demo-steel-mug", url: "/products/steel-mug-photo.png", alt: "ماگ استیل درپوش‌دار", sortOrder: 0 }],
    category: demoCategories[1]
  },
  {
    id: "demo-focus-notebook",
    categoryId: "demo-stationery",
    name: "دفترچه تمرکز",
    slug: "focus-notebook",
    description: "دفترچه جلدسخت با کاغذ کرم و صفحه‌های نقطه‌ای برای یادداشت سریع.",
    priceCredits: 120,
    stock: 64,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-focus-notebook-image", productId: "demo-focus-notebook", url: "/products/focus-notebook-photo.png", alt: "دفترچه جلدسخت و خودکار", sortOrder: 0 }],
    category: demoCategories[2]
  },
  {
    id: "demo-zip-hoodie",
    categoryId: "demo-clothing",
    name: "هودی زیپ‌دار",
    slug: "zip-hoodie",
    description: "هودی پنبه‌ای گرم با زیپ فلزی و دوخت مقاوم برای استفاده روزمره.",
    priceCredits: 480,
    stock: 18,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-zip-hoodie-image", productId: "demo-zip-hoodie", url: "/products/zip-hoodie-photo.png", alt: "هودی زیپ‌دار ذغالی", sortOrder: 0 }],
    category: demoCategories[0]
  },
  {
    id: "demo-cotton-cap",
    categoryId: "demo-clothing",
    name: "کلاه کپ نخی",
    slug: "cotton-cap",
    description: "کلاه کپ سبک با پارچه نخی و بند تنظیم برای استفاده بیرون از محیط کار.",
    priceCredits: 150,
    stock: 32,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-cotton-cap-image", productId: "demo-cotton-cap", url: "/products/cotton-cap-photo.png", alt: "کلاه کپ مشکی", sortOrder: 0 }],
    category: demoCategories[0]
  },
  {
    id: "demo-canvas-tote",
    categoryId: "demo-clothing",
    name: "کیف پارچه‌ای",
    slug: "canvas-tote",
    description: "کیف پارچه‌ای بادوام برای حمل وسایل روزانه، دفترچه و خریدهای کوچک.",
    priceCredits: 210,
    stock: 27,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-canvas-tote-image", productId: "demo-canvas-tote", url: "/products/canvas-tote-photo.png", alt: "کیف پارچه‌ای مشکی", sortOrder: 0 }],
    category: demoCategories[0]
  },
  {
    id: "demo-thermal-bottle",
    categoryId: "demo-daily",
    name: "قمقمه حرارتی",
    slug: "thermal-bottle",
    description: "قمقمه فلزی عایق با درِ حلقه‌ای برای نگهداری نوشیدنی گرم یا سرد.",
    priceCredits: 240,
    stock: 36,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-thermal-bottle-image", productId: "demo-thermal-bottle", url: "/products/thermal-bottle-photo.png", alt: "قمقمه حرارتی مشکی", sortOrder: 0 }],
    category: demoCategories[1]
  },
  {
    id: "demo-felt-desk-mat",
    categoryId: "demo-daily",
    name: "زیر‌دستی نمدی",
    slug: "felt-desk-mat",
    description: "زیر‌دستی نمدی برای میز کار که سطحی نرم و مرتب برای ماوس و لوازم روزانه می‌سازد.",
    priceCredits: 260,
    stock: 16,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-felt-desk-mat-image", productId: "demo-felt-desk-mat", url: "/products/felt-desk-mat-photo.png", alt: "زیر‌دستی نمدی و ماوس", sortOrder: 0 }],
    category: demoCategories[1]
  },
  {
    id: "demo-key-organizer",
    categoryId: "demo-daily",
    name: "جاکلیدی چرمی",
    slug: "key-organizer",
    description: "جاکلیدی چرمی جمع‌وجور برای نظم‌دادن به کلیدهای روزانه.",
    priceCredits: 170,
    stock: 45,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-key-organizer-image", productId: "demo-key-organizer", url: "/products/key-organizer-photo.png", alt: "جاکلیدی چرمی مشکی", sortOrder: 0 }],
    category: demoCategories[1]
  },
  {
    id: "demo-daily-planner",
    categoryId: "demo-stationery",
    name: "پلنر روزانه",
    slug: "daily-planner",
    description: "پلنر جلدسخت با کاغذ کرم برای برنامه‌ریزی روزانه و ثبت کارها.",
    priceCredits: 190,
    stock: 30,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-daily-planner-image", productId: "demo-daily-planner", url: "/products/daily-planner-photo.png", alt: "پلنر جلدسخت ذغالی", sortOrder: 0 }],
    category: demoCategories[2]
  },
  {
    id: "demo-pencil-case",
    categoryId: "demo-stationery",
    name: "جامدادی پارچه‌ای",
    slug: "pencil-case",
    description: "جامدادی زیپ‌دار و مقاوم برای نگهداری ابزار نوشتن و لوازم ریز.",
    priceCredits: 130,
    stock: 52,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-pencil-case-image", productId: "demo-pencil-case", url: "/products/pencil-case-photo.png", alt: "جامدادی پارچه‌ای مشکی", sortOrder: 0 }],
    category: demoCategories[2]
  },
  {
    id: "demo-pen-set",
    categoryId: "demo-stationery",
    name: "ست خودکار فلزی",
    slug: "pen-set",
    description: "دو خودکار فلزی روان در جعبه مینیمال برای هدیه‌دادن و استفاده روزمره.",
    priceCredits: 220,
    stock: 22,
    isActive: true,
    deletedAt: null,
    images: [{ id: "demo-pen-set-image", productId: "demo-pen-set", url: "/products/pen-set-photo.png", alt: "ست خودکار فلزی مشکی", sortOrder: 0 }],
    category: demoCategories[2]
  }
];
