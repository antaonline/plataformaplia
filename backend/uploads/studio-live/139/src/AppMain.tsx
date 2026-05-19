import React from "react";
import Hero from "./components/Hero";
import BentoGrid from "./components/BentoGrid";
import Services from "./components/Services";
import { cn } from "./lib/utils";

const AppMain = () => {
  return (
    <div className={cn("bg-[#050505] text-white", "p-24")}>    
      <Hero />
      <BentoGrid />
      <Services />
      {/* Agregaremos más secciones aquí como Storytelling, Pricing, Galería, FAQ y Contacto */}
    </div>
  );
};

export default AppMain;