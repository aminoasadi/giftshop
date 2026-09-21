"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginMode = "otp" | "password";

export function LoginForm({ callbackUrl = "/dashboard", defaultMode = "otp" }: { callbackUrl?: string; defaultMode?: LoginMode }) {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<LoginMode>(defaultMode);
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
        const form = new FormData(event.currentTarget);
        setError("");

        if (mode === "password") {
          startTransition(async () => {
            const result = await signIn("credentials", {
              email,
              password: form.get("password"),
              redirect: false,
              callbackUrl
            });
            if (result?.error) {
              setError("ایمیل یا رمز عبور درست نیست.");
              return;
            }
            router.push(result?.url ?? callbackUrl);
            router.refresh();
          });
          return;
        }

        if (!codeRequested) {
          startTransition(requestCode);
          return;
        }
        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            otp: form.get("otp"),
            redirect: false,
            callbackUrl
          });
          if (result?.error) {
            setError("کد واردشده درست نیست یا اعتبارش تمام شده است.");
            return;
          }
          router.push(result?.url ?? callbackUrl);
          router.refresh();
        });
      }}
    >
      <label className="login-field">
        <span>ایمیل</span>
        <input autoComplete="email" className="input" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} readOnly={mode === "otp" && codeRequested} required />
      </label>
      {mode === "password" ? (
        <label className="login-field">
          <span>رمز عبور</span>
          <input autoComplete="current-password" className="input" name="password" type="password" required />
        </label>
      ) : null}
      {mode === "otp" && codeRequested ? <>
        <label className="login-field">
          <span>کد شش‌رقمی</span>
          <input autoComplete="one-time-code" className="input otp-input" inputMode="numeric" maxLength={6} name="otp" pattern="[0-9]{6}" required />
        </label>
        <button className="login-text-button" type="button" disabled={isPending} onClick={() => setCodeRequested(false)}>تغییر ایمیل</button>
      </> : null}
      {error ? <p className="login-error" role="alert">{error}</p> : null}
      <button className="button w-full" type="submit" disabled={isPending}>
        {isPending ? "در حال بررسی..." : mode === "password" ? "ورود با رمز" : codeRequested ? "تأیید و ورود" : "ارسال کد ورود"}
      </button>
      <button
        className="login-text-button justify-self-start"
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          setCodeRequested(false);
          setMode(mode === "otp" ? "password" : "otp");
        }}
      >
        {mode === "otp" ? "ورود ادمین با رمز" : "ورود کاربر با کد ایمیل"}
      </button>
    </form>
  );
}
