import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Quantaly - L'Architettura dell'Apprendimento Adattivo | Fondata da Arun Maso",
  description: "Quantaly è l'ecosistema EdTech enterprise ideato e fondato da Arun Maso. Coniuga Micro-Learning Feed con sicurezza Zero-Trust, Semantic Neuro-Mapping Engine per l'inclusione universale (DSA/BES), Learn-to-Earn Marketplace e Quantaly Awards.",
  keywords: [
    "Quantaly",
    "Arun Maso",
    "Arun Maso Fondatore",
    "EdTech",
    "Apprendimento Adattivo",
    "Micro-Learning Feed",
    "Zero-Trust EdTech",
    "Learn-to-Earn",
    "DSA BES Accessibilità",
    "Quantaly Awards",
    "Scuola Digitale",
    "Inclusione Cognitiva",
    "AI EdTech"
  ],
  authors: [{ name: "Arun Maso", url: "https://quantaly.edu" }],
  creator: "Arun Maso",
  publisher: "Quantaly EdTech",
  applicationName: "Quantaly",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Quantaly",
  },
  icons: {
    icon: '/unnamed_edited (1).png',
    apple: '/unnamed_edited (1).png',
  },
  openGraph: {
    title: "Quantaly - L'Architettura dell'Apprendimento Adattivo | Fondata da Arun Maso",
    description: "La piattaforma EdTech di classe enterprise creata da Arun Maso che trasforma il tempo su schermo in capitale cognitivo misurabile.",
    url: "https://quantaly.edu",
    siteName: "Quantaly",
    images: [
      {
        url: '/unnamed_edited (1).png',
        width: 1200,
        height: 630,
        alt: 'Quantaly - Platform created by Arun Maso',
      }
    ],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantaly - Fondata da Arun Maso",
    description: "Rivoluzione EdTech con Micro-Learning Feed e Semantic Neuro-Mapping Engine.",
    creator: "@ArunMaso",
    images: ['/unnamed_edited (1).png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#050710",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://quantaly.edu/#organization",
      "name": "Quantaly",
      "url": "https://quantaly.edu",
      "logo": "https://quantaly.edu/unnamed_edited (1).png",
      "founder": {
        "@type": "Person",
        "name": "Arun Maso",
        "jobTitle": "Fondatore e Chief Software Architect",
        "description": "Nativo digitale e ideatore dell'ecosistema EdTech Quantaly."
      },
      "description": "Ecosistema EdTech enterprise con Micro-Learning Feed, Zero-Trust e Semantic Neuro-Mapping Engine."
    },
    {
      "@type": "Person",
      "@id": "https://quantaly.edu/#founder",
      "name": "Arun Maso",
      "jobTitle": "Fondatore & Chief Architect",
      "knowsAbout": ["EdTech", "Adaptive Learning", "Zero-Trust Architecture", "AI in Education"],
      "worksFor": {
        "@id": "https://quantaly.edu/#organization"
      }
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="bg-[#050710] text-slate-100 antialiased min-h-screen overflow-x-clip" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
