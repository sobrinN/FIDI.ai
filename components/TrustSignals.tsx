import React, { useEffect, useState, useRef } from 'react';
import { Stat } from '../types';

const stats: Stat[] = [
  { id: '1', value: 98, suffix: '%', label: 'Taxa de Precisão' },
  { id: '2', value: 450, suffix: 'M+', label: 'Pontos de Dados' },
  { id: '3', value: 24, suffix: '/7', label: 'Disponibilidade' },
  { id: '4', value: 12, suffix: 'ms', label: 'Latência' },
];

const Counter: React.FC<{ end: number; suffix: string; duration?: number }> = ({ end, suffix, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration / 16); // 60fps
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={ref} className="flex items-baseline">
      <span className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-white tracking-tighter">
        {count}
      </span>
      <span className="font-display text-3xl md:text-4xl text-blue-500 ml-1">{suffix}</span>
    </div>
  );
};

export const TrustSignals: React.FC = () => {
  return (
    <section id="trust" className="py-20 md:py-24 px-6 md:px-12 bg-transparent relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
           backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
           backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16 lg:gap-24">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col">
              <div className="h-px w-full bg-gradient-to-r from-blue-500 to-transparent mb-6 md:mb-8 opacity-30" />
              <Counter end={stat.value} suffix={stat.suffix} />
              <p className="font-mono text-xs md:text-sm text-blue-400 mt-2 md:mt-4 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 md:mt-32 relative">
          <div className="absolute -top-8 md:-top-12 left-0 font-display text-8xl md:text-9xl text-blue-500 opacity-10 select-none pointer-events-none">
            "
          </div>
          <blockquote className="font-sans text-2xl md:text-4xl lg:text-5xl font-light text-center leading-tight max-w-5xl mx-auto text-white">
            <span className="text-blue-400">A FIDI.ai é sensacional.</span> Me impressionei com a precisão e criatividade dos agentes.
          </blockquote>
          <div className="mt-10 md:mt-12 text-center">
            <p className="font-display font-bold text-white text-lg">Lucas Nery</p>
            <p className="font-mono text-blue-500 text-xs md:text-sm">CEO, Pórtico Imobiliária</p>
          </div>
        </div>
      </div>
    </section>
  );
};