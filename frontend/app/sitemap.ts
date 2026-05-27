import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://plia.pe";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/como-funciona", priority: 0.9, changeFrequency: "monthly" },
    { path: "/planes", priority: 0.9, changeFrequency: "weekly" },
    { path: "/web-hosting", priority: 0.9, changeFrequency: "weekly" },
    { path: "/tu-web-con-ia", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ecommerce", priority: 0.9, changeFrequency: "monthly" },
    { path: "/consigue-tu-dominio", priority: 0.8, changeFrequency: "monthly" },
    { path: "/sobre-nosotros", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contacto", priority: 0.6, changeFrequency: "monthly" },
    { path: "/privacidad", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terminos", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
