"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function FormSubmitButton({
  children,
  pendingLabel,
  className
}: Readonly<{
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <Button className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </Button>
  );
}
