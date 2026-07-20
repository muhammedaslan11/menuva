"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, ErrorText, Input, Label } from "@/components/admin/ui";
import { adminLoginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      Giriş yap
    </Button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" autoFocus />
      </div>
      <div>
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      <ErrorText>{state.error}</ErrorText>
      <SubmitButton />
    </form>
  );
}
