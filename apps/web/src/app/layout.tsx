import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PonchoCapital Wealth Portal",
  description: "Private wealth portal for PonchoCapital clients."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
