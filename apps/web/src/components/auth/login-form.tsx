"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ponchocapital.com");
  const [password, setPassword] = useState("PonchoAdmin123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function fillAdminDemo() {
    setEmail("admin@ponchocapital.com");
    setPassword("PonchoAdmin123");
    setError(null);
  }

  function fillClientDemo() {
    setEmail("client@ponchocapital.com");
    setPassword("PonchoClient123");
    setError(null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("No pudimos validar tus credenciales.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1f4d3a]/10 bg-white/70">
            <Image alt="PonchoCapital" className="h-6 w-auto object-contain" height={24} priority src="/logo.png" width={24} />
          </div>
          <p className="text-xs uppercase tracking-[0.34em] text-[#1f4d3a]/75">Private Wealth Platform</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-[#173126]">PonchoCapital Wealth Portal</h1>
        <p className="mt-3 text-sm leading-6 text-[#6d7f75]">Visualizacion privada de portfolios, rendimiento y trazabilidad operativa interna.</p>
      </div>
      <div className="mb-5 flex gap-2">
        <Button className="flex-1" onClick={fillAdminDemo} type="button" variant="secondary">
          Demo admin
        </Button>
        <Button className="flex-1" onClick={fillClientDemo} type="button" variant="secondary">
          Demo cliente
        </Button>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-2 block text-sm text-[#476457]">Email</label>
          <Input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </div>
        <div>
          <label className="mb-2 block text-sm text-[#476457]">Password</label>
          <Input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
        </div>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <Button className="h-12 w-full" disabled={isLoading} type="submit">
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
      <div className="mt-6 rounded-2xl border border-[#1f4d3a]/10 bg-[#1f4d3a]/5 p-4 text-sm text-[#5f7368]">
        <p>Admin demo: `admin@ponchocapital.com` / `PonchoAdmin123`</p>
        <p>Cliente demo: `client@ponchocapital.com` / `PonchoClient123`</p>
      </div>
    </Card>
  );
}
