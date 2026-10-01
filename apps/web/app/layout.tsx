import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { OrdersProvider } from "@/context/orders-context";
import { DevDrawer } from "@/components/dev-drawer";
import { CopilotGlobal } from "@/components/copilot/copilot-global";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Urboa | Gestão Predial Urbana & IA",
  description: "Sistema Integrado de Manutenção e Zeladoria Pública Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <OrdersProvider>
            {children}
            <DevDrawer />
            <CopilotGlobal />
          </OrdersProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

