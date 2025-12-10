import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-12 px-6 border-t border-blue-900/30">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-brand text-2xl tracking-normal text-white">FIDI.ai</span>
          <span className="font-mono text-xs text-blue-500 mt-2">© 2025 FIDI.ai LTDA</span>
        </div>
        
        <div className="flex gap-8 font-mono text-xs text-blue-400 uppercase">
          <a href="#" className="hover:text-white transition-colors">Protocolo de Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Termos de Serviço</a>
          <a href="#" className="hover:text-white transition-colors">Status do Sistema</a>
        </div>
      </div>
    </footer>
  );
};