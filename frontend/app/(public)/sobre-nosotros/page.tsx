'use client'

import { useState } from 'react'
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Target, Users, Sparkles } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

//import teamImage from "../imagenes/team-collaboration.jpg";

const values = [
  {
    icon: Heart,
    title: "Cercanía",
    description: "No somos una empresa fría y distante. Somos personas que entienden tus necesidades y te tratamos como lo que eres: un emprendedor con sueños.",
  },
  {
    icon: Target,
    title: "Simplicidad",
    description: "Odiamos los términos técnicos tanto como tú. Por eso hablamos claro, explicamos todo de forma simple y hacemos que el proceso sea fácil.",
  },
  {
    icon: Users,
    title: "Compromiso",
    description: "Tu éxito es nuestro éxito. No descansamos hasta que tengas una web que te represente y que te ayude a conseguir más clientes.",
  },
  {
    icon: Sparkles,
    title: "Calidad",
    description: "Cada web que hacemos es como si fuera para nosotros mismos. Diseño profesional, código limpio y atención al detalle en todo.",
  },
];

const stats = [
  { number: "500+", label: "Webs creadas" },
  { number: "98%", label: "Clientes satisfechos" },
  { number: "3", label: "Años de experiencia" },
  { number: "50+", label: "Rubros atendidos" },
];

const SobreNosotros = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-hero-gradient">
        <div className="section-container">
          <SectionHeader
            badge="Sobre PLIA"
            title="Hacemos webs para quienes no saben de webs"
            description="Somos un equipo peruano que cree que todos merecen tener una presencia profesional en internet, sin importar cuánto sepan de tecnología."
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <img
                src="/imagenes/team-collaboration.jpg"
                alt="Equipo de PLIA trabajando"
                className="rounded-2xl shadow-xl w-full"
              />
            </AnimatedSection>

            <div>
              <AnimatedSection>
                <span className="inline-block text-sm font-medium px-4 py-1.5 rounded-full bg-cta/10 text-foreground mb-4">
                  Nuestra historia
                </span>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Nacimos para simplificar lo complicado
                </h2>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    PLIA nació cuando vimos a muchos emprendedores peruanos con negocios 
                    increíbles que no tenían presencia en internet. ¿La razón? Les parecía 
                    muy difícil, muy caro o muy técnico.
                  </p>
                  <p>
                    Nosotros sabíamos que eso no tenía que ser así. Crear una web puede 
                    ser simple si tienes al equipo correcto de tu lado.
                  </p>
                  <p>
                    Por eso creamos PLIA: una forma fácil, accesible y cercana de tener 
                    tu página web profesional. Sin términos raros, sin procesos complicados, 
                    sin sorpresas en el precio.
                  </p>
                  <p className="font-medium text-foreground">
                    Hoy, más de 500 negocios peruanos confían en nosotros. Y queremos 
                    que el tuyo sea el siguiente.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-foreground text-primary-foreground">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-cta mb-2">{stat.number}</p>
                <p className="text-primary-foreground/70">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <SectionHeader
            badge="Lo que nos mueve"
            title="Nuestros valores"
            description="Estos son los principios que guían cada proyecto que hacemos."
          />

          <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 0.1}>
                <div className="p-6 rounded-2xl bg-white border border-border h-full">
                  <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <span className="inline-block text-sm font-medium px-4 py-1.5 rounded-full bg-cta/10 text-foreground mb-4">
                Nuestra misión
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Democratizar el acceso a internet para los emprendedores peruanos
              </h2>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Creemos que cada negocio, sin importar su tamaño, merece tener una 
                presencia profesional en internet. Nuestra misión es eliminar las 
                barreras técnicas y económicas que impiden que miles de emprendedores 
                peruanos lleguen a más clientes a través de la web.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="p-6 rounded-2xl bg-cta/5 border border-cta/20 inline-block">
                <p className="text-xl font-semibold text-foreground">
                  "Tu web lista, sin complicaciones" 
                </p>
                <p className="text-muted-foreground mt-1">
                  — Esa es nuestra promesa
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Why Peru Section */}
      <section className="py-16 md:py-20 bg-secondary/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              badge="🇵🇪 Hechos en Perú"
              title="¿Por qué un equipo local importa?"
              description=""
            />

            <div className="mt-8 space-y-6">
              <AnimatedSection delay={0.1}>
                <div className="p-6 rounded-2xl bg-white border border-border">
                  <h3 className="font-bold text-foreground mb-2">Entendemos tu contexto</h3>
                  <p className="text-muted-foreground">
                    Sabemos cómo funcionan los negocios en Perú. Conocemos los bancos, 
                    las formas de pago, las preferencias de tus clientes. No necesitamos 
                    que nos expliques cómo funciona tu mercado.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="p-6 rounded-2xl bg-white border border-border">
                  <h3 className="font-bold text-foreground mb-2">Horario compatible</h3>
                  <p className="text-muted-foreground">
                    Estamos disponibles cuando tú lo estás. Nada de esperar horas 
                    por diferencia de zona horaria o traducir mensajes.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="p-6 rounded-2xl bg-white border border-border">
                  <h3 className="font-bold text-foreground mb-2">Pagos en soles</h3>
                  <p className="text-muted-foreground">
                    Precios en soles, sin tipo de cambio, sin cargos internacionales. 
                    Puedes pagar por transferencia, Yape o Plin.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-foreground text-primary-foreground">
        <div className="section-container text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Conoce a tu próximo equipo web
            </h2>
          </AnimatedSection>
          
          <AnimatedSection delay={0.1}>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Escríbenos y conversemos sobre cómo podemos ayudarte a llevar 
              tu negocio al siguiente nivel.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="cta" size="lg" asChild>
                <Link href="/contacto">
                  Contáctanos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="white" size="lg" asChild>
                <Link href="/planes">Ver nuestros planes</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default SobreNosotros;
