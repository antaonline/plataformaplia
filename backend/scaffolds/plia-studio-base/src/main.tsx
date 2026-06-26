import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
// Estilos del editor visual de PLIA (padding/tamaño/tipografía ajustados a
// mano). Va AL FINAL para ganarle a los estilos generados. Persiste por
// proyecto: el scaffold no lo sobrescribe (regla "copiar una sola vez").
import "./plia-overrides.css";

createRoot(document.getElementById("root")!).render(<App />);
