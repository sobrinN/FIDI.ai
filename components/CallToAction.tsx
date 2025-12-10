import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface CallToActionProps {
  onAccessSystem?: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onAccessSystem }) => {
  return (
    <section className="py-24 md:py-32 flex flex-col justify-center items-center px-6 bg-transparent relative">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tech/1920/1080')] opacity-5 bg-cover bg-center mix-blend-overlay grayscale" />
      
      <div className="container mx-auto text-center relative z-10">
        <Reveal direction="up" className="mx-auto">
          <h2 className="font-display text-5xl md:text-8xl lg:text-9xl font-bold mb-6 md:mb-8 tracking-tighter text-white">
            PRONTO PARA <br />
            <span className="text-blue-500">EVOLUIR?</span>
          </h2>
        </Reveal>

        <Reveal delay={0.2} direction="up" className="mx-auto">
          <p className="font-sans text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-12 md:mb-16 leading-relaxed">
            Junte-se aos que economizam tempo. E coloque o FIDI para trabalhar ao seu lado.
          </p>
        </Reveal>

        <Reveal delay={0.4} direction="up" className="mx-auto">
          <button 
            onClick={onAccessSystem}
            className="group relative inline-flex items-center justify-center px-10 py-5 md:px-12 md:py-6 bg-blue-600 text-white font-display font-bold text-lg md:text-xl tracking-wide overflow-hidden rounded-full transition-all duration-500 hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-4 group-hover:gap-6 transition-all duration-300">
              INICIAR SEQUÊNCIA
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-0 mix-blend-overlay" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};