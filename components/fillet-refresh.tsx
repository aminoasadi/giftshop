"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dbrApplyFillets?: () => void;
  }
}

export function FilletRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const firstFrame = window.requestAnimationFrame(() => {
      window.dbrApplyFillets?.();
    });
    const secondFrame = window.requestAnimationFrame(() => {
      window.dbrApplyFillets?.();
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  return null;
}
