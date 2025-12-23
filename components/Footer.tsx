import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-page py-12 px-6 border-t border-gray-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="flex flex-col items-start gap-4">
          <h4 className="font-sans font-bold text-xl tracking-tight text-text-primary">FIDI.ai</h4>
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            © 2025 FIDI.ai Systems
          </span>
        </div>

        <div className="flex gap-8">
          <a href="#" className="font-mono text-xs text-text-secondary hover:text-text-primary uppercase tracking-wide transition-colors">Privacidade</a>
          <a href="#" className="font-mono text-xs text-text-secondary hover:text-text-primary uppercase tracking-wide transition-colors">Termos</a>
          <a href="#" className="font-mono text-xs text-text-secondary hover:text-text-primary uppercase tracking-wide transition-colors">Status</a>
        </div>
      </div>
    </footer>
  );
};