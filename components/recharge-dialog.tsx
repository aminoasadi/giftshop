"use client";

import { useState } from "react";
import { WalletCards, X } from "lucide-react";

export function RechargeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="button secondary" type="button" onClick={() => setIsOpen(true)}>
        <WalletCards size={18} />
        شارژ اعتبار
      </button>

      {isOpen ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            aria-labelledby="recharge-dialog-title"
            aria-modal="true"
            className="modal-panel glass feature-card p-6"
            data-chamfer="br"
            data-cut="34"
            data-fillet="10"
            data-radius="12"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" aria-label="بستن" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
            <p className="eyebrow">شارژ کیف پول</p>
            <h2 id="recharge-dialog-title" className="chrome-title text-2xl">کد اعتبار را وارد کنید</h2>
            <form action="/api/recharge/redeem" method="post" className="mt-6 grid gap-4">
              <label className="login-field">
                <span>کد شارژ</span>
                <input className="input text-left" dir="ltr" name="code" maxLength={6} placeholder="A1B2C" required autoFocus />
              </label>
              <button className="button" type="submit">
                شارژ اعتبار
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
