"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Planes", href: "/planes" },
  { name: "Cómo funciona", href: "/como-funciona" },
  { name: "Sobre PLIA", href: "/sobre-nosotros" },
  { name: "Contacto", href: "/contacto" },
];


export default function Header() {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  /* SECCIÓN QUE PONE FONDO EN PÁGINAS INTERNAS */
  const pagesWithSolidBg = ["/planes", "/como-funciona", "/sobre-nosotros", "/contacto", "/terminos", "/privacidad"]
  const hasSolidBg = pagesWithSolidBg.includes(pathname)
  /* FIN - SECCIÓN QUE PONE FONDO EN PÁGINAS INTERNAS */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`section-container mt-2 mx-4 md:mx-auto lg:mx-auto rounded-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${
        isScrolled
          ? "bg-customheader !mt-4 backdrop-blur-xl shadow-sm py-3"
          : hasSolidBg
          ? "bg-customheader backdrop-blur-xl shadow-sm py-3"
          : "bg-transparent py-5"
      }`}

    >
      <div className="main-menu">
        <nav className="flex items-center justify-between">
          <div className="flex items-center justify-start"> 
            <Link href="/" className="pr-10 flex items-center gap-2">
              <Image
                src="/plia-logo-white.svg"
                alt="PLIA"
                width={120}
                height={32}
                priority
                className="h-8 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="content-menu hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`item-menu text-sm font-medium transition-colors hover:text-foreground ${
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button className="hablarsoporte" variant="ghost" asChild>
              <Link href="/contacto">Hablar con soporte</Link>
            </Button>
            <Button variant="cta" asChild>
              <Link href="/planes">Ver Planes</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login" className="inline-flex items-center gap-2">
                <User size={16} />
                Ingresar
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-background"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 rounded-sm bg-white border-t border-border"
          >
            <div className="section-container py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium py-2 transition-colors ${
                    location.pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" className="inline-flex items-center justify-center gap-2">
                    <User size={16} />
                    Ingresar
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/contacto">Hablar con soporte</Link>
                </Button>
                <Button variant="cta" asChild className="w-full">
                  <Link href="/planes">Ver Planes</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
