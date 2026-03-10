import type { Metadata } from "next";
/*import { sansationfont } from "next/font/google"*/

import Script from "next/script";
import "app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


/*const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/

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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <>
        <Script
          src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
          strategy="afterInteractive"
        />

        <div className="min-h-screen flex flex-col">

          <Header />
            <main style={{ padding: "0px" }}>
              {children}
            </main>
          <Footer />

        </div>
      </>
     
  );
}
