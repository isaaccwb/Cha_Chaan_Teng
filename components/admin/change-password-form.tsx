"use client";

import { useRef, useState, useTransition } from "react";
import { changeOwnPassword } from "@/lib/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setMessage(null);
    startTransition(async () => {
      const result = await changeOwnPassword(formData);
      if (result.success) {
        setMessage({ type: "ok", text: "搞掂,密碼已經改咗。" });
        formRef.current?.reset();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-md border-[1.5px] border-[var(--cct-milktea-600)] bg-[var(--card)] p-5 shadow-sticker"
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">而家個密碼</span>
        <Input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 bg-[var(--background)]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">新密碼(至少 8 個字)</span>
        <Input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 bg-[var(--background)]"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">確認新密碼</span>
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-11 bg-[var(--background)]"
        />
      </label>

      {message && (
        <p
          className={
            message.type === "ok"
              ? "text-sm text-[var(--cct-green-800)]"
              : "text-sm text-[var(--destructive)]"
          }
        >
          {message.text}
        </p>
      )}

      <Button type="submit" variant="secondary" disabled={isPending} className="w-fit">
        {isPending ? "改緊…" : "改密碼"}
      </Button>
    </form>
  );
}
