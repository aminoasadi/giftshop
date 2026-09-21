import { PrismaClient, Role, RechargeCodeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@houseoftechnocrats.ir";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "ادمین فروشگاه",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      wallet: { upsert: { update: {}, create: { balance: 0 } } }
    },
    create: {
      email: adminEmail,
      name: "ادمین فروشگاه",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      wallet: { create: { balance: 0 } }
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "کاربر نمونه",
      passwordHash: await bcrypt.hash("User12345!", 12),
      wallet: { create: { balance: 350 } },
      addresses: {
        create: {
          fullName: "کاربر نمونه",
          phone: "۰۹۱۲۱۲۳۴۵۶۷",
          postalCode: "۱۲۳۴۵۶۷۸۹۰",
          line: "تهران، خیابان نمونه، پلاک ۱۲",
          isDefault: true
        }
      }
    }
  });

  const categories = await Promise.all(
    [
      ["پوشاک", "clothing"],
      ["لوازم روزمره", "daily"],
      ["نوشت‌افزار", "stationery"]
    ].map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug }
      })
    )
  );

  const [clothing, daily, stationery] = categories;

  await prisma.product.upsert({
    where: { slug: "tech-shirt" },
    update: {
      images: {
        updateMany: {
          where: { url: "/products/tech-shirt.svg" },
          data: { url: "/products/tech-shirt-photo.png", alt: "تیشرت مشکی تکنوکرات" }
        }
      }
    },
    create: {
      categoryId: clothing.id,
      name: "تیشرت تکنوکرات",
      slug: "tech-shirt",
      description: "تیشرت پنبه‌ای با چاپ مینیمال برند؛ مناسب استفاده روزمره و رویدادها.",
      priceCredits: 300,
      stock: 24,
      images: { create: { url: "/products/tech-shirt-photo.png", alt: "تیشرت مشکی تکنوکرات" } }
    }
  });

  await prisma.product.upsert({
    where: { slug: "steel-mug" },
    update: {
      images: {
        updateMany: {
          where: { url: "/products/steel-mug.svg" },
          data: { url: "/products/steel-mug-photo.png", alt: "ماگ استیل درپوش‌دار" }
        }
      }
    },
    create: {
      categoryId: daily.id,
      name: "ماگ استیل",
      slug: "steel-mug",
      description: "ماگ سبک و مقاوم برای میز کار؛ ارسال با پیک ویژه خانه تکنوکرات‌ها.",
      priceCredits: 180,
      stock: 40,
      images: { create: { url: "/products/steel-mug-photo.png", alt: "ماگ استیل درپوش‌دار" } }
    }
  });

  await prisma.product.upsert({
    where: { slug: "focus-notebook" },
    update: {
      images: {
        updateMany: {
          where: { url: "/products/focus-notebook.svg" },
          data: { url: "/products/focus-notebook-photo.png", alt: "دفترچه جلدسخت و خودکار" }
        }
      }
    },
    create: {
      categoryId: stationery.id,
      name: "دفترچه تمرکز",
      slug: "focus-notebook",
      description: "دفترچه جلدسخت با کاغذ کرم و صفحه‌های نقطه‌ای برای یادداشت سریع.",
      priceCredits: 120,
      stock: 64,
      images: { create: { url: "/products/focus-notebook-photo.png", alt: "دفترچه جلدسخت و خودکار" } }
    }
  });

  const extraProducts = [
    { categoryId: clothing.id, name: "هودی زیپ‌دار", slug: "zip-hoodie", description: "هودی پنبه‌ای گرم با زیپ فلزی و دوخت مقاوم برای استفاده روزمره.", priceCredits: 480, stock: 18, imageUrl: "/products/zip-hoodie-photo.png", alt: "هودی زیپ‌دار ذغالی" },
    { categoryId: clothing.id, name: "کلاه کپ نخی", slug: "cotton-cap", description: "کلاه کپ سبک با پارچه نخی و بند تنظیم برای استفاده بیرون از محیط کار.", priceCredits: 150, stock: 32, imageUrl: "/products/cotton-cap-photo.png", alt: "کلاه کپ مشکی" },
    { categoryId: clothing.id, name: "کیف پارچه‌ای", slug: "canvas-tote", description: "کیف پارچه‌ای بادوام برای حمل وسایل روزانه، دفترچه و خریدهای کوچک.", priceCredits: 210, stock: 27, imageUrl: "/products/canvas-tote-photo.png", alt: "کیف پارچه‌ای مشکی" },
    { categoryId: daily.id, name: "قمقمه حرارتی", slug: "thermal-bottle", description: "قمقمه فلزی عایق با درِ حلقه‌ای برای نگهداری نوشیدنی گرم یا سرد.", priceCredits: 240, stock: 36, imageUrl: "/products/thermal-bottle-photo.png", alt: "قمقمه حرارتی مشکی" },
    { categoryId: daily.id, name: "زیر‌دستی نمدی", slug: "felt-desk-mat", description: "زیر‌دستی نمدی برای میز کار که سطحی نرم و مرتب برای ماوس و لوازم روزانه می‌سازد.", priceCredits: 260, stock: 16, imageUrl: "/products/felt-desk-mat-photo.png", alt: "زیر‌دستی نمدی و ماوس" },
    { categoryId: daily.id, name: "جاکلیدی چرمی", slug: "key-organizer", description: "جاکلیدی چرمی جمع‌وجور برای نظم‌دادن به کلیدهای روزانه.", priceCredits: 170, stock: 45, imageUrl: "/products/key-organizer-photo.png", alt: "جاکلیدی چرمی مشکی" },
    { categoryId: stationery.id, name: "پلنر روزانه", slug: "daily-planner", description: "پلنر جلدسخت با کاغذ کرم برای برنامه‌ریزی روزانه و ثبت کارها.", priceCredits: 190, stock: 30, imageUrl: "/products/daily-planner-photo.png", alt: "پلنر جلدسخت ذغالی" },
    { categoryId: stationery.id, name: "جامدادی پارچه‌ای", slug: "pencil-case", description: "جامدادی زیپ‌دار و مقاوم برای نگهداری ابزار نوشتن و لوازم ریز.", priceCredits: 130, stock: 52, imageUrl: "/products/pencil-case-photo.png", alt: "جامدادی پارچه‌ای مشکی" },
    { categoryId: stationery.id, name: "ست خودکار فلزی", slug: "pen-set", description: "دو خودکار فلزی روان در جعبه مینیمال برای هدیه‌دادن و استفاده روزمره.", priceCredits: 220, stock: 22, imageUrl: "/products/pen-set-photo.png", alt: "ست خودکار فلزی مشکی" }
  ];

  for (const { imageUrl, alt, ...product } of extraProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, images: { create: { url: imageUrl, alt } } }
    });
  }

  await prisma.rechargeCode.createMany({
    data: [
      { code: "12345", valueCredits: 500 },
      { code: "908172", valueCredits: 250 },
      { code: "66001", valueCredits: 100, status: RechargeCodeStatus.DISABLED },
      { code: "777888", valueCredits: 150, status: RechargeCodeStatus.EXPIRED, expiresAt: new Date("2024-01-01") },
      { code: "54321", valueCredits: 200, status: RechargeCodeStatus.USED, usedByUserId: user.id, usedAt: new Date() }
    ],
    skipDuplicates: true
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: admin.id,
      action: "SEED_CREATED",
      target: "database",
      metadata: { note: "داده‌های اولیه توسعه ساخته شد." }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
