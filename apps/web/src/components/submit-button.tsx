"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleText: string;
  pendingText: string;
  className?: string;
};

export function SubmitButton({ idleText, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ?? "rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
      }
    >
      {pending ? pendingText : idleText}
    </button>
  );
}
