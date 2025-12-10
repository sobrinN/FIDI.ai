import React from 'react';
import { Feature } from '../types';
import { Reveal } from './Reveal';
import { Layers, Cpu, Zap, Network, ArrowUpRight } from 'lucide-react';

const features: Feature[] = [
  {
    id: '01',
    title: 'Agente de programação',
    description: 'Age de forma eficiente, organizada e minimalista na construção de código.',
    technical: 'FIDI'
  },
  {
    id: '02',
    title: 'Agente de redação',
    description: 'Age de forma precisa na escrita criativa e técnica em vários segmentos.',
    technical: 'TUNIN'
  },
  {
    id: '03',
    title: 'Agente de organização',
    description: 'Age de forma sistemática focado na gestão de recursos e cronogramas.',
    technical: 'MORCEGO'
  },
  {
    id: '04',
    title: 'Agente de design',
    description: 'Age de forma abstrata para ilustrar, animar e colorir suas histórias.',
    technical: 'NENECA'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="pt-0 pb-32 px-6 md:px-12 bg-transparent relative z-10">
      <div className="container mx-auto max-w-7xl">
        {/* Header spacer */}
        <div className="hidden md:flex mb-20 border-b border-blue-900/30 pb-4 justify-end items-end opacity-50">
          <Reveal>
             <h2 className="font-mono text-xs text-blue-500 tracking-[0.2em] uppercase">Matriz de Capacidades v.2.0</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <Reveal key={feature.id} delay={index * 0.1} width="100%">
              <div className="group relative bg-black/20 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 transition-all duration-700 h-full min-h-[400px] flex flex-col justify-between p-8 lg:p-12 overflow-hidden">
                
                {/* Hover Glow Effect */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-blue-500/30 transition-all duration-500 group-hover:w-4 group-hover:h-4 group-hover:border-blue-400" />
                <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-blue-500/30 transition-all duration-500 group-hover:w-4 group-hover:h-4 group-hover:border-blue-400" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-blue-500/30 transition-all duration-500 group-hover:w-4 group-hover:h-4 group-hover:border-blue-400" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-blue-500/30 transition-all duration-500 group-hover:w-4 group-hover:h-4 group-hover:border-blue-400" />

                {/* Top Section */}
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-12">
                     <span className="font-mono text-blue-500/40 text-sm tracking-widest group-hover:text-blue-400 transition-colors">
                       /{feature.id}
                     </span>
                     <div className="text-white/20 group-hover:text-blue-400 transition-colors duration-500 transform group-hover:rotate-90">
                       {index === 0 && <Layers strokeWidth={1} size={32} />}
                       {index === 1 && <Cpu strokeWidth={1} size={32} />}
                       {index === 2 && <Network strokeWidth={1} size={32} />}
                       {index === 3 && <Zap strokeWidth={1} size={32} />}
                     </div>
                   </div>

                   <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-white group-hover:text-blue-50 transition-colors duration-300 leading-[0.9] tracking-tight">
                     {feature.title}
                   </h3>
                   
                   <p className="font-sans text-lg text-gray-400 leading-relaxed max-w-sm group-hover:text-gray-300 transition-colors">
                     {feature.description}
                   </p>
                </div>

                {/* Bottom Section */}
                <div className="relative z-10 mt-12 flex items-end justify-between border-t border-white/5 pt-6 group-hover:border-blue-500/20 transition-colors duration-500">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-1">Codename</span>
                    <span className="font-mono text-sm text-blue-400 tracking-wider">
                      {feature.technical}
                    </span>
                  </div>
                  
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white text-gray-500 transition-all duration-300">
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
