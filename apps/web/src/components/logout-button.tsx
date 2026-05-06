"use client";

import { signOut } from "next-auth/react";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className ?? "rounded-md bg-black px-4 py-2 text-white"}
    >
      Cikis Yap
    </button>
  );
}
