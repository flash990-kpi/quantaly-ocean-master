import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Quantaly - L'Architettura dell'Apprendimento Adattivo",
  description: "Ecosistema EdTech enterprise con Micro-Learning Feed, Learn-to-Earn, Neuro-Mapping Engine e Quantaly Awards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quantaly",
  },
  icons: {
    icon: '/unnamed_edited (1).png',
    apple: '/unnamed_edited (1).png',
  }
};

export const viewport: Viewport = {
  themeColor: "#050710",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/unnamed_edited (1).png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#050710" />
      </head>
      <body className="bg-[#050710] text-slate-100 antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
