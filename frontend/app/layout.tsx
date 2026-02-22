import type { Metadata } from "next";
/*import { Sansation } from "next/font/google";*/
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

/*const sansationfont = Sansation ({
  subsets: ["latin"],
  variable: "--font-sansation",
  weight: ["300", "400", "700"], // ← OBLIGATORIO
  display: "swap",
});*/

export const metadata: Metadata = {
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
        className={` antialiased`}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
          strategy="afterInteractive"
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
