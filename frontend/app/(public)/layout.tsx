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
  title: "PLIA",
  description: "Lovable Generated Project",
  openGraph: {
    title: "Lovable App",
    description: "Lovable Generated Project",
    images: [
      {
        url: "https://lovable.dev/opengraph-image-p98pqg.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
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
