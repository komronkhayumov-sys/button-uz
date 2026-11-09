import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BUTTON Admin — Boshqaruv Paneli",
  description: "BUTTON Men's Wear do'koni buyurtmalar va mahsulotlar boshqaruv paneli",
  manifest: "/manifest-admin.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BTN Admin",
  },
  icons: {
    icon: "/btn-logo.png",
    apple: "/btn-logo.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
