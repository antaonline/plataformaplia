import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  // base: "./" hace que el build genere paths RELATIVOS en index.html y
  // sus chunks (./assets/...) — asi el SPA funciona tanto en root (/)
  // como bajo un subpath (/uploads/studio-dist/<id>/). Sin esto Vite
  // emite paths absolutos (/assets/) que solo funcionan en root.
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
