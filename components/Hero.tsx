import React from 'react';
import { Reveal } from './Reveal';
import { HeroAnimation } from './HeroAnimation/HeroAnimation';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen flex flex-col justify-center items-start px-6 md:px-24 bg-page text-text-primary overflow-hidden">

      <div className="relative z-10 max-w-4xl mt-12">
        <Reveal delay={0.1} direction="up" width="100%">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-text-secondary/50"></div>
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              Sistema Operacional de Agentes
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2} direction="up" width="100%">
          <h1 className="font-sans text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9] mb-8 text-text-primary">
            Construa o futuro <br />
            <span className="text-accent">com inteligência.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.4} direction="up" width="100%">
          <p className="font-sans text-xl text-text-secondary max-w-xl leading-relaxed mb-10">
            FIDI é a plataforma nativa para desenvolvimento de software assistido por agentes autônomos.
          </p>
        </Reveal>

        <Reveal delay={0.5} direction="up" width="100%">
          <div className="flex flex-wrap gap-4">
            <button className="h-[40px] px-8 bg-text-primary text-white rounded-sm font-sans text-sm font-medium hover:bg-accent transition-colors shadow-sm">
              Começar Agora
            </button>
            <button className="h-[40px] px-8 border border-gray-300 bg-transparent text-text-primary rounded-sm font-sans text-sm font-medium hover:border-text-primary transition-colors">
              Documentação
            </button>
          </div>
        </Reveal>
      </div>

      {/* Industrial Footer/Grid elements */}
      <div className="absolute right-0 bottom-0 p-8 md:p-12 hidden md:block">
        <div className="font-mono text-[10px] text-text-secondary/60 flex flex-col items-end gap-2">
          <span>COORD: 24.55.12</span>
          <span>STATUS: ONLINE</span>
          <span>VER: 2.0.4</span>
        </div>
      </div>

      {/* Subtle Grid Background (optional, kept minimal for now) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

      {/* Hero Animation Layer - Positioned purely visual */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-full md:w-1/2 h-full z-0 opacity-40 md:opacity-100 pointer-events-none hidden md:block">
        <HeroAnimation />
      </div>

    </section>
  );
};