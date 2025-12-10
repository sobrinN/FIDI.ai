import React from 'react';
import { Reveal } from './Reveal';
import { NeuralPlanet } from './NeuralPlanet';

export const ValueProposition: React.FC = () => {
  return (
    <section id="value" className="relative pt-24 md:pt-32 pb-0 px-6 md:px-12 bg-transparent overflow-hidden">
      
      {/* Background Graphic - Subtle Blue Glow */}
      <div className="absolute right-0 top-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <div className="lg:col-span-8">
            <Reveal>
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.9] tracking-tighter mb-10 text-white">
                SEM <br />
                <span className="text-blue-500">ENROLAÇÃO.</span>
              </h2>
            </Reveal>
            
            <Reveal delay={0.2}>
              <p className="font-sans text-lg md:text-2xl text-blue-200 max-w-3xl leading-relaxed">
                A maioria dos Agents imita. <span className="text-white">O FIDI entende.</span> Ele se auto-organiza e evita todo aquele vai e vem que acontece quando se trabalha usando LLM's.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end h-full pt-12 lg:pt-0">
            <Reveal delay={0.4} direction="left">
              <div className="glass-panel p-8 rounded-lg relative overflow-hidden group hover:border-blue-400/30 transition-colors duration-500 bg-black/40 backdrop-blur-sm border-blue-500/10">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                 <h3 className="font-mono text-xs text-white mb-4">DIRETRIZ CENTRAL</h3>
                 <p className="font-sans text-lg text-blue-100 font-light">
                   "Trazer suas idéias a vida ou ajudar a organiza-las."
                 </p>
                 <div className="mt-6 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="font-mono text-xs text-blue-400">OTIMIZAÇÃO: 99.9%</span>
                 </div>
              </div>
            </Reveal>
          </div>

        </div>

        <div className="mt-20 md:mt-24 border-t border-blue-900/30 pt-16 md:pt-20 pb-12 w-full">
           <Reveal delay={0.2} width="100%">
             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end w-full gap-8 lg:gap-12">
                <div className="flex flex-col gap-4 mb-8 lg:mb-0 relative">
                   {/* Neural Planet Positioned Here */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] h-[300px] md:w-[400px] md:h-[400px] pointer-events-none opacity-60">
                      <NeuralPlanet />
                   </div>

                   <span className="font-mono text-white text-5xl md:text-6xl tracking-widest relative z-10 mix-blend-difference">04</span>
                   <span className="font-mono text-blue-400 text-lg md:text-xl tracking-[0.2em] uppercase relative z-10">Agentes autônomos</span>
                </div>
                
                <div className="w-full lg:w-auto text-right">
                     <h3 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[0.95] py-2 tracking-tighter text-white select-none mix-blend-difference">
                       QUE SÃO EFICIENTES E<br />
                       <span className="text-blue-600 transition-colors duration-700 hover:text-blue-500">AUTO-ORGANIZÁVEIS.</span>
                     </h3>
                </div>
             </div>
           </Reveal>
        </div>

      </div>
    </section>
  );
};