import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackgroundParallax from "@/components/BackgroundParallax";
import { defaultMetadata } from "@/lib/seo";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200 overflow-x-hidden">
        {/* Google Analytics Placeholder */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LZHWQW3YYC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LZHWQW3YYC');
          `}
        </Script>
        <Providers>
          <BackgroundParallax />
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-10 z-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
