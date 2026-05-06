"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const email = formData.get("email");
    const password = formData.get("password");
    if (typeof email !== "string" || typeof password !== "string") {
      setError("E-posta ve sifre zorunludur.");
      setIsPending(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Giris bilgileri hatali.");
      setIsPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="w-full space-y-4 rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Giris Bilgileri</h2>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="coach@smartcoach.app"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Sifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="******"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={isPending} className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60">
        {isPending ? "Giris yapiliyor..." : "Giris Yap"}
      </button>
    </form>
  );
}
