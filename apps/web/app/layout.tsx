import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { OrdersProvider } from "@/context/orders-context";
import { OnboardingProvider } from "@/context/onboarding-context";
import { DevDrawer } from "@/components/dev-drawer";
import { CopilotGlobal } from "@/components/copilot/copilot-global";
import { OnboardingGlobal } from "@/components/onboarding/onboarding-global";

import { Analytics } from "@vercel/analytics/next";
import { FlagValues } from "flags/react";
import { VercelToolbar } from "@vercel/toolbar/next";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Urboa | Gestão Predial Urbana & IA",
  description: "Sistema Integrado de Manutenção e Zeladoria Pública Inteligente",
};

const defaultFlagValues = {
  "copilot-assistant": true,
  "preventive-maintenance": true,
  "geo-dispatching": true,
  "dev-drawer": true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shouldInjectToolbar = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <OrdersProvider>
            <OnboardingProvider>
              {children}
              <DevDrawer />
              <CopilotGlobal />
              <OnboardingGlobal />
            </OnboardingProvider>
          </OrdersProvider>
        </AuthProvider>
        <Analytics />
        <FlagValues values={defaultFlagValues} />
        {shouldInjectToolbar && <VercelToolbar />}
      </body>
    </html>
  );
}

