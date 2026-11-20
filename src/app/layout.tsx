import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/auth-provider";

/**
 * DM Sans, self-hosted.
 *
 * `next/font/google` downloads the font at build time, which makes every build
 * — including CI and any machine behind a filter that blocks Google — depend
 * on fonts.googleapis.com being reachable. Serving the file ourselves removes
 * that dependency, drops a third-party request from every page load, and keeps
 * visitor IPs away from Google. The variable file covers 100–1000, so all four
 * weights the design uses come from one 37 KB download.
 *
 * Licensed under the SIL Open Font License 1.1 — see ./fonts/LICENSE.txt.
 */
const dmSans = localFont({
  src: [
    {
      path: "./fonts/dm-sans-latin-wght-normal.woff2",
      style: "normal",
      weight: "100 1000",
    },
    {
      path: "./fonts/dm-sans-latin-ext-wght-normal.woff2",
      style: "normal",
      weight: "100 1000",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name} Careers`,
  },
  description: SITE.description,
  applicationName: `${SITE.name} Careers`,
  keywords: [
    "hospitality jobs",
    "hotel jobs",
    "chef jobs abroad",
    "Gulf hospitality careers",
    "Kuwait hotel jobs",
    "Qatar hospitality jobs",
    "Oman hotel jobs",
    "F&B jobs",
    "overseas placement Kerala",
  ],
  authors: [{ name: SITE.legalName, url: SITE.parentUrl }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: `${SITE.name} Careers`,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  sameAs: [SITE.parentUrl, SITE.social.linkedin, SITE.social.facebook],
  description:
    "Hospitality recruitment and management firm placing hotel, culinary and F&B professionals with employers across the Gulf and Europe.",
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.addressParts.street,
    addressLocality: SITE.addressParts.locality,
    addressRegion: SITE.addressParts.region,
    postalCode: SITE.addressParts.postalCode,
    addressCountry: SITE.addressParts.country,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "recruitment",
    email: SITE.email,
    telephone: SITE.phone,
    availableLanguage: ["en", "ml", "hi"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <AuthProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
