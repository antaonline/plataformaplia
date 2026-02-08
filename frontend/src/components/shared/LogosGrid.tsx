'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import React from "react";

const logos = [
  { src: 'https://a.storyblok.com/f/337048/147x41/4343e31b5a/ryder.svg', alt: 'Ryder' },
  { src: 'https://a.storyblok.com/f/337048/181x34/ff208a2c17/prologis.svg', alt: 'Prologis' },
  { src: 'https://a.storyblok.com/f/337048/118x46/d178bf93df/nfi.svg', alt: 'NFI', highlight: true },
  { src: 'https://a.storyblok.com/f/337048/170x44/9386c9fae8/lineage.svg', alt: 'Lineage' },
  { src: 'https://a.storyblok.com/f/337048/114x45/04e08dca33/8vc.svg', alt: '8VC' },
];

const logos2 = [
  { src: 'https://a.storyblok.com/f/337048/147x41/4343e31b5a/ryder.svg', alt: 'Ryder' },
  { src: 'https://a.storyblok.com/f/337048/118x46/d178bf93df/nfi.svg', alt: 'NFI', highlight: true },
  { src: 'https://a.storyblok.com/f/337048/170x44/9386c9fae8/lineage.svg', alt: 'Lineage' },
];

export function LogosGrid() {
  return (
    
  <div className="relative overflow-hidden">
  {/* GRID */}
  <div className="hidden lg:block relative z-10">
    {/* aquí va TODO tu código actual */}

    <div className="logo-grid grid md:grid-cols-7 divide-x divide-gray-300">
      <div></div>
      <div className="col-span-5 grid grid-cols-5 col-start-2 divide-x divide-gray-300">
      {Array.from({ length: 5 }).map((_, i) => (
        
        <div
          key={i} className="logo  aspect-square bg-white/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="slot__wrapper  inset-0 flex items-center justify-center">
          </div>
        </div>
        
      ))}  
      </div>
      <div></div>
    </div>

    <div className="logo-grid border grid md:grid-cols-7 divide-x divide-gray-300">
    <div></div>

      <div className="col-span-5 grid grid-cols-5 col-start-2 divide-x divide-gray-300">
        {logos.map((logo, index) => (
          <div
            key={logo.alt}
            className="logo relative transition delay-50 duration-500 hover:border-2 border-[0px] border-transparent hover:!border-cta ease-in-out aspect-square bg-white/80 backdrop-blur-sm overflow-hidden px-6"
            style={{ zIndex: logos.length - index }}
          >
            <div className="slot__wrapper absolute inset-0 flex items-center justify-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={180}
                height={60}
                className="image h-10 w-lg opacity-90"
              />
            </div>
          </div>
        ))}
      </div>

    <div></div>
    </div>

    <div className="logo-grid border grid md:grid-cols-7 divide-x divide-gray-300">
    <div></div>

      <div className="col-span-5 grid grid-cols-5 col-start-2 divide-x divide-gray-300">
        <div
          className="logo  aspect-square bg-white/80 backdrop-blur-sm overflow-hidden"
        >
  
          <div className="slot__wrapper  inset-0 flex items-center justify-center">
          
          </div>

        </div>
        {logos2.map((logo, index) => (      
          <div
            key={logo.alt}
            className="logo relative transition delay-50 duration-500 hover:border-2 border-[0px] border-transparent hover:!border-cta ease-in-out aspect-square bg-white/80 backdrop-blur-sm overflow-hidden px-6"
            style={{ zIndex: logos2.length - index }}
          >
            <div className="slot__wrapper absolute inset-0 flex items-center justify-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={180}
                height={60}
                className="image h-10 w-lg opacity-90"
              />
            </div>
          </div>
        ))}
        <div
          className="logo  aspect-square bg-white/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="slot__wrapper  inset-0 flex items-center justify-center">
          </div>
        </div>
      </div>

    <div></div>
    </div>


    <div className="logo-grid grid md:grid-cols-7 divide-x divide-gray-300">
      <div></div>
      <div className="col-span-5 grid grid-cols-5 col-start-2 divide-x divide-gray-300">
      {Array.from({ length: 5 }).map((_, i) => (
        

        <div
          key={i} className="logo  aspect-square bg-white/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="slot__wrapper  inset-0 flex items-center justify-center">
          </div>
        </div>
        
      ))}  
      </div>
      <div></div>
    </div>
  </div>

  {/* FADE OVERLAY */}
  <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.17)_45%,rgba(255,255,255,0.9)_70%,#fff_100%)]" />
  </div>
  
  );
}
