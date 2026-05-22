import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { OrchestratorProvider } from "@/app/demo/_providers/OrchestratorProvider";
import AppLayout from "@/app/demo/_components/AppLayout";

const montserrat = Montserrat({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402stream",
  description: "Manage custom autonomous AI agents executing software tasks settling payments through HTTP 402 challenges broadcasted on the Morph L2 blockchain network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        "dark",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        montserrat.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-zinc-700 selection:text-white">
        <OrchestratorProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </OrchestratorProvider>
      </body>
    </html>
  );
}
