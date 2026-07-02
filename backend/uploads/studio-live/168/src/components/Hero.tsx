import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-surface">
      <div className="container mx-auto py-20 px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
        <motion.div
          className="mb-10 lg:mb-0 lg:w-1/2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-black font-heading leading-tight tracking-tight lg:leading-none">
            Descubre Cacadadez de Lujo
          </h1>
          <p className="mt-6 text-lg font-body text-text lg:max-w-md">
            Explora nuestra exclusiva selección de casas y departamentos de lujo en las mejores ubicaciones.
          </p>
          <button
            className={cn(
              'mt-8 inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm',
              'bg-accent text-primary hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
            )}
          >
            Explorar Cacadadez
            <ArrowRight className="ml-3" />
          </button>
        </motion.div>
        <motion.div
          className="relative lg:w-1/2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="http://localhost:3002/uploads/media/upload-1781147427396-973718741.png"
            alt="Propiedad de lujo con vista a la ciudad"
            width={800}
            height={600}
            className="rounded-lg shadow-lg"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </motion.div>
      </div>
    </section>
  );
}