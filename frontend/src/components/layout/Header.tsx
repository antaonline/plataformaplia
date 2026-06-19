"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  MonitorSmartphone,
  ShoppingBag,
  Sparkles,
  Globe2,
  LayoutTemplate,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type MegaMenuItem = {
  name: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

type MegaMenuSection = {
  title: string;
  items: MegaMenuItem[];
};

const navLinks = [
  { name: "Inicio", href: "/" },
  { name: "Planes", href: "/planes" },
  { name: "Cómo funciona", href: "/como-funciona" },
  { name: "Sobre PLIA", href: "/sobre-nosotros" },
  { name: "Contacto", href: "/contacto" },
];

const megaMenuSections: MegaMenuSection[] = [
  {
    title: "Crea tu sitio web",
    items: [
      {
        name: "Plan Landing",
        href: "/planes",
        description: "Landing lista para vender desde el día uno.",
        icon: LayoutTemplate,
      },
      {
        name: "Plan Web Institucional",
        href: "/planes",
        description: "Hasta 5 páginas para tu negocio y tu marca.",
        icon: MonitorSmartphone,
      },
      {
        name: "Tu web con IA",
        href: "/tu-web-con-ia",
        description: "Tu web en segundos con asistencia de IA.",
        icon: Sparkles,
      },
    ],
  },
  {
    title: "Vende online",
    items: [
      {
        name: "Ecommerce",
        href: "/ecommerce",
        description: "Tu tienda online lista para vender rápido.",
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: "Hosting",
    items: [
      {
        name: "Web Hosting",
        href: "/web-hosting",
        description: "Hosting simple, veloz y fácil de operar.",
        icon: Globe2,
      },
    ],
  },
  {
    title: "Dominios",
    items: [
      {
        name: "Consigue tu Dominio",
        href: "/consigue-tu-dominio",
        description: "Encuentra el nombre ideal para tu negocio.",
        icon: Globe2,
      },
    ],
  },
];

const productRoutes = ["/tu-web-con-ia", "/ecommerce", "/web-hosting", "/consigue-tu-dominio"];
const solidBackgroundMatchers = [
  "/planes",
  "/como-funciona",
  "/sobre-nosotros",
  "/contacto",
  "/terminos",
  "/privacidad",
  "/tu-web-con-ia",
  "/ecommerce",
  "/web-hosting",
  "/consigue-tu-dominio",
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMegaOpen, setIsMobileMegaOpen] = useState(false);
  const [isDesktopMegaOpen, setIsDesktopMegaOpen] = useState(false);
  const pathname = usePathname();

  const hasSolidBg = solidBackgroundMatchers.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isProductsActive = productRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  // El blog usa tema CLARO → header claro sólido con texto/logo oscuro (sino el
  // texto blanco se pierde sobre el fondo claro). Ver clase .bg-blogheader.
  const isBlog = pathname === "/blog" || pathname.startsWith("/blog/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileMegaOpen(false);
    setIsDesktopMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopMegaOpen(false);
        setIsMobileMegaOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header
      className={`section-container fixed left-0 right-0 top-0 z-50 mt-2 mx-4 rounded-sm transition-all duration-300 md:mx-auto lg:mx-auto ${
        isBlog
          ? "bg-blogheader py-3 shadow-sm backdrop-blur-xl"
          : isScrolled
            ? "bg-customheader !mt-4 py-3 shadow-sm backdrop-blur-xl"
            : hasSolidBg
              ? "bg-customheader py-3 shadow-sm backdrop-blur-xl"
              : "bg-transparent py-5"
      }`}
    >
      <div className="main-menu relative">
        <nav className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link href="/" className="flex items-center gap-2 pr-10">
              <Image
                src={isBlog ? "/plia-logo-black.svg" : "/plia-logo-white.svg"}
                alt="PLIA"
                width={120}
                height={32}
                priority
                className="h-8 w-auto"
              />
            </Link>

            <div className="content-menu hidden items-center gap-8 lg:flex">
              <Link
                href="/"
                className={`item-menu text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === "/" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Inicio
              </Link>

              <button
                type="button"
                className={`item-menu inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                  isProductsActive || isDesktopMegaOpen ? "text-foreground" : "text-muted-foreground"
                }`}
                onMouseEnter={() => setIsDesktopMegaOpen(true)}
                onClick={() => setIsDesktopMegaOpen((prev) => !prev)}
                aria-expanded={isDesktopMegaOpen}
              >
                Productos
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDesktopMegaOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`item-menu text-sm font-medium transition-colors hover:text-foreground ${
                    pathname === link.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
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

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`p-2 lg:hidden ${isBlog ? "text-foreground" : "text-background"}`}
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        <AnimatePresence>
          {isDesktopMegaOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-x-0 top-full hidden pt-4 lg:block"
              onMouseEnter={() => setIsDesktopMegaOpen(true)}
              onMouseLeave={() => setIsDesktopMegaOpen(false)}
            >
              <div className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[32px] border border-border/60 bg-white/95 shadow-[0_32px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                <div className="grid gap-0 xl:grid-cols-4">
                  {megaMenuSections.map((section) => (
                    <div key={section.title} className="border-b border-border/60 p-6 xl:border-b-0 xl:border-r">
                      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0f8b68]">
                        {section.title}
                      </p>
                      <div className="space-y-3">
                        {section.items.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/70"
                              onClick={() => setIsDesktopMegaOpen(false)}
                            >
                              <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/5 text-foreground transition-colors group-hover:bg-cta group-hover:text-cta-foreground">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{item.name}</p>
                                <p className="mt-1 max-w-[15rem] text-sm leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-sm border-t border-border bg-white lg:hidden"
          >
            <div className="section-container flex flex-col gap-4 py-6">
              <Link
                href="/"
                className={`py-2 text-base font-medium transition-colors ${
                  pathname === "/" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Inicio
              </Link>

              <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-base font-medium text-foreground"
                  onClick={() => setIsMobileMegaOpen((prev) => !prev)}
                >
                  Productos
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isMobileMegaOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isMobileMegaOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-5">
                        {megaMenuSections.map((section) => (
                          <div key={section.title}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f8b68]">
                              {section.title}
                            </p>
                            <div className="space-y-2">
                              {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-start gap-3 rounded-2xl bg-white px-3 py-3"
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5 text-foreground">
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">{item.name}</p>
                                      <p className="mt-1 text-sm leading-snug text-muted-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 text-base font-medium transition-colors ${
                    pathname === link.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="flex flex-col gap-3 border-t border-border pt-4">
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
}
