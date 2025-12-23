import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface CallToActionProps {
  onAccessSystem?: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onAccessSystem }) => {
  return (
    <section className="py-32 px-6 md:px-12 bg-text-primary text-white relative overflow-hidden">
      <div className="container mx-auto text-center relative z-10">
        <Reveal direction="up" className="mx-auto">
          <h2 className="font-sans text-5xl md:text-8xl font-medium mb-12 tracking-tighter leading-none text-white">
            PRONTO PARA <br />
            <span className="text-accent">EVOLUIR?</span>
          </h2>
        </Reveal>

        <Reveal delay={0.2} direction="up" className="mx-auto">
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button
              onClick={onAccessSystem}
              className="group relative inline-flex items-center justify-center px-12 py-5 bg-white text-text-primary font-sans font-medium text-lg rounded-sm transition-all duration-300 hover:bg-gray-200"
            >
              <span className="flex items-center gap-3">
                INICIAR SISTEMA
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>

            <button className="px-12 py-5 border border-white/20 text-white font-sans font-medium text-lg rounded-sm hover:bg-white/10 transition-colors">
              FALAR COM VENDAS
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};