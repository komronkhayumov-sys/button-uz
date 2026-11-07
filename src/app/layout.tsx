import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegister from "@/components/common/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "BUTTON Men's Wear — Toshkent Erkaklar Kiyimlari (@button_uz)",
  description:
    "BUTTON Men's Wear (@button_uz) — Toshkentdagi 4 ta filial. Zamonaviy kostyumlar, kurtkalar, poyabzal va aksessuarlar. Tezkor yetkazib berish va 1-bosqichli buyurtma.",
  keywords: [
    "button_uz",
    "erkaklar kiyimlari",
    "kostyum toshkent",
    "kurtka toshkent",
    "men's wear tashkent",
    "button kiyim",
    "chilonzor",
    "beruniy",
    "risoviy",
    "shahriston",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BUTTON",
  },
  icons: {
    icon: "/btn-logo.png",
    apple: "/btn-logo.png",
  },
  openGraph: {
    title: "BUTTON Men's Wear (@button_uz)",
    description: "Toshkentdagi 4 ta filial. Zamonaviy erkaklar kiyimlari va mini-katalog.",
    type: "website",
    locale: "uz_UZ",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090D14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/btn-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased select-none sm:select-auto selection:bg-violet-700 selection:text-white">
        <Script id="button-theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('button_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            })();
          `}
        </Script>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
