import Image from "next/image";
import { motion } from "framer-motion";
import { Check, X, Zap, Server, DollarSign, Headphones } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

interface ComparisonItem {
  icon: React.ReactNode;
  feature: string;
  plia: boolean;
  freelancers: boolean;
  agencies: boolean;
}

const comparisonData: ComparisonItem[] = [
  {
    icon: <Zap className="w-5 h-5 text-muted-foreground" />,
    feature: "Entrega en tiempo récord",
    plia: true,
    freelancers: false,
    agencies: false,
  },
  {
    icon: <Server className="w-5 h-5 text-muted-foreground" />,
    feature: "Hosting propio",
    plia: true,
    freelancers: false,
    agencies: false,
  },
  {
    icon: <DollarSign className="w-5 h-5 text-muted-foreground" />,
    feature: "Precios super competitivos",
    plia: true,
    freelancers: true,
    agencies: false,
  },
  {
    icon: <Headphones className="w-5 h-5 text-muted-foreground" />,
    feature: "Soporte rápido y directo",
    plia: true,
    freelancers: false,
    agencies: true,
  },
];

const CheckIcon = () => (
  <motion.div
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="w-6 h-6 rounded-full bg-cta flex items-center justify-center"
  >
    <Check className="w-4 h-4 text-white" />
  </motion.div>
);

const XIcon = () => (
  <motion.div
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <X className="w-5 h-5 text-muted-foreground/50" />
  </motion.div>
);

export const ComparisonTable = () => {
  return (
    <AnimatedSection delay={0.2}>
      <div className="mx-auto bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-5 font-normal text-muted-foreground w-[40%]">
                  {/* Empty header for feature column */}
                </th>
                <th className="text-center p-5 w-[20%] bg-border/25">
                  <span className="text-cta font-bold text-lg flex justify-center">

                      <Image
                        src="/plia-logo-black.svg"
                        alt="PLIA"
                        width={120}
                        height={20}
                        priority
                        className="h-6 w-20 flex-shrink-0"
                      />

                  </span>
                </th>
                <th className="text-center p-5 font-normal text-muted-foreground w-[20%]">
                  Freelancers
                </th>
                <th className="text-center p-5 font-normal text-muted-foreground w-[20%]">
                  Agencias
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <motion.tr
                  key={row.feature}
                  className="border-b border-border last:border-0"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {row.icon}
                      <span className="text-foreground font-medium">{row.feature}</span>
                    </div>
                  </td>
                  <td className="p-5 bg-border/25">
                    <div className="flex justify-center">
                      {row.plia ? <CheckIcon /> : <XIcon />}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      {row.freelancers ? <CheckIcon /> : <XIcon />}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center">
                      {row.agencies ? <CheckIcon /> : <XIcon />}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedSection>
  );
};
