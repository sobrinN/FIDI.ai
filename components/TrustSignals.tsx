import React from 'react';
import { Stat } from '../types';
import { Reveal } from './Reveal';

const stats: Stat[] = [
  { id: '1', value: 1.5, suffix: 'x', label: 'Eficácia de Token' },
  { id: '2', value: 20, suffix: '', label: 'Modelos Integrados' },
  { id: '3', value: 100, suffix: '%', label: 'Disponibilidade' },
];

export const TrustSignals: React.FC = () => {
  return (
    <section id="trust" className="py-24 px-6 md:px-12 bg-page text-text-primary border-t border-gray-300">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 0.1} width="100%">
              <div className="flex flex-col items-center">
                <div className="flex items-baseline mb-2 justify-center">
                  <span className="font-sans font-medium text-6xl tracking-tighter text-text-primary">
                    {stat.value}
                  </span>
                  <span className="font-sans text-3xl text-text-secondary ml-1">{stat.suffix}</span>
                </div>
                <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-32 text-center">
          <Reveal width="100%">
            <div className="max-w-4xl mx-auto">
              <p className="font-mono text-xs text-text-secondary mb-6 uppercase tracking-widest">Feedback do Sistema</p>
              <blockquote className="font-sans text-3xl md:text-5xl font-medium leading-tight text-text-primary mb-8">
                "A FIDI.ai redefine a interação com agentes. Precisão industrial para problemas complexos."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-10 h-10 bg-gray-300 rounded-sm"></div>
                <div className="text-left">
                  <p className="font-sans font-bold text-sm text-text-primary">Lucas Nery</p>
                  <p className="font-mono text-xs text-text-secondary">CEO, Pórtico Real Estate</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};