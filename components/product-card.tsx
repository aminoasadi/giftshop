import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, WalletCards } from "lucide-react";
import { formatCredits } from "@/lib/persian";
import type { PublicProduct } from "@/lib/demo-data";

export function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];

  return (
    <article className="product-shell">
      <Link href={`/products/${product.slug}`} className="product-card feature-card block" data-chamfer="tr" data-cut="30" data-radius="12" data-fillet="10">
        <div className="product-media">
          {image ? <Image src={image.url} alt={image.alt} fill className="object-cover" /> : null}
        </div>
        <div className="space-y-5 p-5">
          <div>
            <h3 className="text-[21px] font-extrabold leading-[1.7] text-chrome">{product.name}</h3>
            <p className="line-clamp-2 text-sm leading-8 text-muted">{product.description}</p>
          </div>
          <div className="flex items-end justify-between gap-4 border-t border-[#1D466766] pt-4">
            <span>
              <small className="block text-xs text-muted">ارزش اعتباری</small>
              <strong className="text-xl text-chrome">{formatCredits(product.priceCredits)}</strong>
            </span>
            <span className="grid size-11 place-items-center bg-[#04101C] text-chrome" aria-label="مشاهده محصول">
              <ArrowLeft size={19} />
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <WalletCards size={15} />
            خرید فقط با کیف پول اعتباری
          </div>
        </div>
      </Link>
    </article>
  );
}
