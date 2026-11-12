import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda UBS",
  description:
    "Sistema de agendamento de consultas do posto de saúde comunitário.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
