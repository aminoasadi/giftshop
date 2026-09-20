"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function requestCode() {
    setError("");
    const response = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.message ?? "ارسال کد انجام نشد.");
      return;
    }
    setCodeRequested(true);
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!codeRequested) {
          startTransition(requestCode);
          return;
        }
        const form = new FormData(event.currentTarget);
        setError("");
        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            otp: form.get("otp"),
            redirect: false,
            callbackUrl: "/dashboard"
          });
          if (result?.error) {
            setError("کد واردشده درست نیست یا اعتبارش تمام شده است.");
            return;
          }
          router.push(result?.url ?? "/dashboard");
          router.refresh();
        });
      }}
    >
      <label className="login-field">
        <span>ایمیل</span>
        <input autoComplete="email" className="input" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={codeRequested} required />
      </label>
      {codeRequested ? <>
        <label className="login-field">
          <span>کد شش‌رقمی</span>
          <input autoComplete="one-time-code" className="input otp-input" inputMode="numeric" maxLength={6} name="otp" pattern="[0-9]{6}" required />
        </label>
        <button className="login-text-button" type="button" disabled={isPending} onClick={() => setCodeRequested(false)}>تغییر ایمیل</button>
      </> : null}
      {error ? <p className="login-error" role="alert">{error}</p> : null}
      <button className="button w-full" type="submit" disabled={isPending}>
        {isPending ? "در حال بررسی..." : codeRequested ? "تأیید و ورود" : "ارسال کد ورود"}
      </button>
    </form>
  );
}
