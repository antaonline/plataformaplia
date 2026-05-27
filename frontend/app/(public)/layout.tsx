import Script from "next/script";
import "app/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


/*const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});*/

// Metadata global vive en app/layout.tsx; cada pagina publica define
// la suya en su propio layout.tsx (per-route) para SEO especifico.

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
