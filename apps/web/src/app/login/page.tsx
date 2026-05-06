import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.role === "COACH") redirect("/coach");
  if (session?.user?.role === "STUDENT") redirect("/student");

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-4xl rounded-2xl border bg-white p-4 shadow-sm md:grid md:grid-cols-2 md:gap-6 md:p-6">
        <section className="rounded-xl bg-zinc-900 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">SmartCoach</p>
          <h1 className="mt-3 text-2xl font-bold">Panele Giris</h1>
          <p className="mt-3 text-sm text-zinc-300">
            Koc veya ogrenci hesabin ile giris yaparak check-in, olcum ve ilerleme takibine devam et.
          </p>
          <div className="mt-6 space-y-2 text-sm text-zinc-200">
            <p>Demo Coach: coach@smartcoach.app / Coach123!</p>
            <p>Demo Student: student@smartcoach.app / Student123!</p>
          </div>
          <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
            Ana sayfaya don
          </Link>
        </section>

        <section className="p-2 md:p-4">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
