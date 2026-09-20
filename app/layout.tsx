import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { FilletRefresh } from "@/components/fillet-refresh";
import { shopConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: `${shopConfig.brandName} | فروشگاه اعتباری`,
  description: "وب‌اپ فروشگاه گیفت‌شاپ فارسی با کیف پول اعتباری و کد شارژ فیزیکی."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <FilletRefresh />
        {children}
        <Script src="/dbr/fillet.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
