import type { Metadata } from "next";
/*import { sansationfont } from "next/font/google"*/


import Script from "next/script";
import "app/globals.css";


export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL 
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL) 
  : null,
  title: "Plia",
  description: "Plataforma de soluciones web sin complicaciones",
  // Páginas privadas (login, dashboard, checkout): fuera del índice de Google.
  robots: { index: false, follow: false },
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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*<html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >*/

       

        <div className="min-h-screen flex flex-col">
          
            <main className="flex-1" style={{ padding: "0px" }}>
              {children}
            </main>
          
        </div>

      /*</body>
    </html>*/
  );
}
