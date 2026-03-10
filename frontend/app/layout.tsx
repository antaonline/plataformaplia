import type { Metadata } from "next";
/*import { Sansation } from "next/font/google";*/
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL 
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL) 
  : null,
  title: "Plia",
  description: "Plataforma de soluciones web sin complicaciones",
  openGraph: {
    title: "Plia Platform",
    description: "Tu Plataforma de soluciones web sin complicaciones",
    images: [
      {
        url: "/pliaportadaurl.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/pliaportadaurl.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`antialiased`}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic-reset.css"
        />
        <link
          rel="stylesheet"
          href="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css"
        />
        <link
          rel="stylesheet"
          href="/izipay-embedded.css"
        />
        <Script
          src="https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
          strategy="afterInteractive"
          data-public-key={process.env.NEXT_PUBLIC_MCW_PUBLIC_KEY}
        />

        <div className="min-h-screen flex flex-col">

            <main style={{ padding: "0px" }}>
              {children}
            </main>

        </div>

      </body>
    </html>
  );
}
