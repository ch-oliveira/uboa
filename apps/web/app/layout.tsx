import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { OrdersProvider } from "@/context/orders-context";
import { DevDrawer } from "@/components/dev-drawer";

// Using inter.className directly to guarantee font rendering
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zelo | Gestão Predial Municipal",
  description: "Sistema Integrado de Manutenção e Zeladoria Pública",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-[#F8FAFC] text-slate-900`}>
        <AuthProvider>
          <OrdersProvider>
            {children}
            <DevDrawer />
          </OrdersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

