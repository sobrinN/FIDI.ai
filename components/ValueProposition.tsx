import React from 'react';
import { Reveal } from './Reveal';
import { ArrowRight } from 'lucide-react';

export const ValueProposition: React.FC = () => {
  return (
    <section id="value" className="py-24 px-6 md:px-12 bg-page text-text-primary border-b border-gray-300 overflow-hidden">
      <div className="container mx-auto max-w-7xl">

        {/* Main Grid Layout - Industrial 3-Column Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-gray-300">

          {/* Column 1: Main Statement */}
          <div className="border-r border-b border-gray-300 p-8 lg:p-12 flex flex-col justify-between min-h-[500px] relative group hover:bg-white transition-colors duration-500">
            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <Reveal>
              <div className="mb-8">
                <span className="font-mono text-xs text-accent uppercase tracking-widest mb-2 block">Enterprise</span>
                <h2 className="font-display text-5xl md:text-6xl font-bold leading-[0.9] tracking-tighter mb-6 text-text-primary uppercase">
                  Sem <br />
                  <span className="text-accent">Enrolação.</span>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-sans text-lg text-text-secondary leading-relaxed max-w-md">
                A maioria das IAs imita. <span className="text-text-primary font-medium">O FIDI entende.</span> Ele se auto-organiza e evita todo aquele vai e vem que acontece quando se trabalha usando LLM's.
              </p>
            </Reveal>

            <div className="mt-12">
              <span className="font-mono text-xs text-text-secondary/60">FIDI.AI // SYSTEM_CORE</span>
            </div>
          </div>

          {/* Column 2: Security & Guidelines (Slider Visuals) */}
          <div className="border-r border-b border-gray-300 p-8 lg:p-12 flex flex-col justify-between min-h-[500px] hover:bg-white transition-colors duration-500 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>

            <Reveal delay={0.3}>
              <div className="mb-12">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-text-secondary">Diretriz Central</h3>
                  <span className="font-mono text-xs text-text-primary">SECURE_LEVEL_1</span>
                </div>

                <p className="font-sans text-xl text-text-primary leading-tight font-light italic">
                  "Trazer suas ideias à vida ou ajudar a organizá-las."
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-text-secondary group cursor-pointer">
                  <span>VER PROTOCOLOS DE SEGURANÇA</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Reveal>

            {/* Industrial Sliders Visual */}
            <Reveal delay={0.4}>
              <div className="flex justify-between items-end gap-2 h-32 px-2">
                {[40, 70, 30, 85, 50, 65, 20].map((height, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="w-8 bg-gray-200 rounded-full relative h-full overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 w-full bg-gray-300 transition-all duration-1000 ease-out group-hover:bg-gray-400"
                        style={{ height: `${height}%` }}
                      ></div>
                      {/* The "Knob" */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-all duration-1000 ease-out"
                        style={{
                          bottom: `calc(${height}% - 8px)`,
                          backgroundColor: i === 3 ? 'var(--color-accent)' : '#A3A3A3'
                        }}
                      ></div>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Column 3: Autonomous Systems (Graph Visuals) */}
          <div className="border-r border-b border-gray-300 p-8 lg:p-12 flex flex-col justify-between min-h-[500px] hover:bg-white transition-colors duration-500">

            <Reveal delay={0.5}>
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-text-secondary">Across Development</h3>
                  <span className="font-mono text-xs text-text-primary">STACK_V.2</span>
                </div>

                <h3 className="font-sans text-2xl font-medium mb-2">Interface e Vendor Agnostic</h3>
                <p className="font-sans text-sm text-text-secondary leading-relaxed">
                  Sistemas autônomos que são eficientes e <br />
                  <span className="text-accent">auto-organizáveis.</span>
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-text-secondary group cursor-pointer">
                  <span>SAIBA MAIS SOBRE ENTERPRISE</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Reveal>

            {/* Industrial Bar Graph Visual */}
            <Reveal delay={0.6}>
              <div className="mt-8">
                {/* Bars */}
                <div className="flex items-end gap-1 h-32 mb-4">
                  {Array.from({ length: 24 }).map((_, i) => {
                    // Create a growing exponential curve visual
                    const height = Math.min(100, Math.pow(i, 1.6) + 10);
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gray-200 hover:bg-accent transition-colors duration-200 rounded-t-[1px]"
                        style={{ height: `${height}%` }}
                      ></div>
                    )
                  })}
                </div>

                {/* Slider Control Visual */}
                <div className="h-6 bg-gray-300 rounded-full relative flex items-center px-1">
                  <div className="absolute left-[10%] w-[15%] h-full bg-text-secondary/20 rounded-l-full"></div>
                  <div className="w-4 h-4 bg-text-primary rounded-full border-2 border-white shadow-md absolute left-[12%] z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  </div>
                  <div className="w-full h-1 bg-gray-400/50 rounded-full mx-2"></div>
                </div>
              </div>
            </Reveal>

          </div>

        </div>
      </div>
    </section>
  );
};