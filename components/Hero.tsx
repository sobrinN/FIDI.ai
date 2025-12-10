import React from 'react';
import { Reveal } from './Reveal';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-transparent">
      
      <div className="relative z-10 text-center px-6">
        <Reveal delay={0.2} direction="up" width="100%">
          <h1 className="font-brand text-[12vw] leading-none tracking-normal text-white select-none mix-blend-difference opacity-90">
            FIDI<span className="text-blue-500">.ai</span>
          </h1>
        </Reveal>

        <Reveal delay={0.6} direction="up" width="100%">
          <div className="mt-8 flex flex-col items-center">
            <p className="font-mono text-blue-400 text-sm tracking-[0.3em] uppercase mb-4 animate-pulse">
              Sistema Online // Pronto
            </p>
            <h2 className="font-sans text-2xl md:text-4xl font-light text-blue-200 max-w-2xl leading-relaxed">
              Te ajudamos a <span className="text-white font-medium">construir</span> seu futuro digital.
            </h2>
          </div>
        </Reveal>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-32 left-12 w-32 h-32 border-l border-t border-blue-500/20 hidden md:block opacity-50" />
      <div className="absolute bottom-32 right-12 w-32 h-32 border-r border-b border-blue-500/20 hidden md:block opacity-50" />
      
      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <span className="font-mono text-xs text-blue-300/60 writing-vertical-rl">INICIALIZAR</span>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent animate-float" />
      </div>
    </section>
  );
};