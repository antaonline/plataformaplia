"use client";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  producto: [
    { name: "Planes", href: "/planes" },
    { name: "Cómo funciona", href: "/como-funciona" },
    { name: "Sobre PLIA", href: "/sobre-nosotros" },
  ],
  soporte: [
    { name: "Contacto", href: "/contacto" },
    { name: "Preguntas frecuentes", href: "/como-funciona#faq" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terminos" },
    { name: "Política de Privacidad", href: "/privacidad" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Image
              src="/plia-logo-white.svg"
              alt="PLIA"
              width={150}
              height={32}
              priority
              className="h-10 w-auto mb-6"
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Tu web lista sin complicaciones. Nosotros nos encargamos de todo para que tú solo te preocupes por tu negocio.
            </p>
            <p className="text-primary-foreground/50 text-sm">
              Lima, Perú 🇵🇪
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="font-semibold text-base mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}

          <div>
            <h4 className="font-semibold text-base mb-4">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-base mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} PLIA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-cta text-sm transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:hola@plia.pe"
              className="text-primary-foreground/70 hover:text-cta text-sm transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
