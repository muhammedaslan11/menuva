"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { pb } from "@/lib/pocketbase";
import { Button, ErrorText, Input, Label } from "@/components/panel/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }

    setLoading(true);
    try {
      await pb.collection("users").create({
        name,
        email,
        password,
        passwordConfirm: password,
      });
      await pb.collection("users").authWithPassword(email, password);
      router.replace("/panel");
    } catch (err) {
      if (err instanceof ClientResponseError && err.response?.data?.email) {
        setError("Bu e-posta zaten kayıtlı.");
      } else {
        setError("Kayıt oluşturulamadı, bilgileri kontrol edip tekrar dene.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-paper p-8">
      <h1 className="font-display text-xl font-bold">Ücretsiz hesap aç</h1>
      <p className="mt-1 text-sm text-ink-soft">Kredi kartı gerekmez, 5 dakikada kurulur.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Adın</Label>
          <Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading} className="w-full">
          Hesap oluştur
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Zaten hesabın var mı?{" "}
        <Link href="/panel/login" className="font-medium text-paprika hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
