import React from 'react';
import { Feature } from '../types';
import { Reveal } from './Reveal';
import { Layers, Cpu, Zap, Network, ArrowUpRight } from 'lucide-react';

const features: Feature[] = [
  {
    id: '01',
    title: 'Programação assistida',
    description: 'Código eficiente, organizado e minimalista com suporte a múltiplas linguagens.',
    technical: 'Claude Sonnet 4.5 · Grok Code Fast'
  },
  {
    id: '02',
    title: 'Escrita criativa',
    description: 'Redação precisa para conteúdo criativo e técnico em diversos formatos.',
    technical: 'Gemini 3.0 Flash · Claude Sonnet 4.5'
  },
  {
    id: '03',
    title: 'Análise e organização',
    description: 'Processamento sistemático de dados focado em gestão e produtividade.',
    technical: 'Claude Sonnet 4.5 · GPT-Oss · DeepSeek 3.2'
  },
  {
    id: '04',
    title: 'Geração visual',
    description: 'Criação de imagens e vídeos para ilustrar e dar vida às suas ideias.',
    technical: 'Flux2 PRO · Qwen Image · Wan Animate · Hailuo 02'
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 md:px-12 bg-page text-text-primary border-t border-gray-300">
      <div className="container mx-auto max-w-7xl">
        {/* Header spacer */}
        <div className="flex mb-16 justify-between items-end">
          <Reveal>
            <h2 className="font-sans text-4xl md:text-5xl font-medium tracking-tight">
              Capacidades
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="hidden md:block font-mono text-xs text-text-secondary tracking-widest uppercase mb-2">
              Matriz v.2.0
            </span>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-300 border border-gray-300">
          {features.map((feature, index) => (
            <div key={feature.id} className="bg-page p-8 md:p-12 hover:bg-white transition-colors duration-300 group min-h-[320px] flex flex-col justify-between">

              {/* Top Section */}
              <div>
                <div className="flex justify-between items-start mb-8">
                  <span className="font-mono text-xs text-text-secondary border border-gray-300 px-2 py-1 rounded-sm">
                    {feature.id}
                  </span>
                  <div className="text-text-secondary group-hover:text-accent transition-colors duration-300">
                    {index === 0 && <Layers strokeWidth={1.5} size={24} />}
                    {index === 1 && <Cpu strokeWidth={1.5} size={24} />}
                    {index === 2 && <Network strokeWidth={1.5} size={24} />}
                    {index === 3 && <Zap strokeWidth={1.5} size={24} />}
                  </div>
                </div>

                <h3 className="font-sans text-2xl font-medium mb-4 text-text-primary">
                  {feature.title}
                </h3>

                <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-sm">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] text-text-secondary/60 uppercase tracking-widest">Modelos</span>
                  <span className="font-mono text-xs text-text-primary">
                    {feature.technical}
                  </span>
                </div>

                <ArrowUpRight size={16} className="text-text-secondary group-hover:text-accent group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
