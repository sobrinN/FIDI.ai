import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-24 right-6 z-[100] max-w-sm w-full md:w-auto pointer-events-auto"
        >
          <div className="glass-panel p-5 rounded-r-lg border-l-2 border-l-white border-y border-r border-blue-500/20 flex items-start gap-4 shadow-[0_0_40px_rgba(59,130,246,0.1)] bg-black/95 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-mono text-xs text-blue-400 uppercase tracking-widest font-bold">Acesso Restrito</h4>
              </div>
              <p className="font-sans text-sm text-blue-200 leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-blue-500 hover:text-white transition-colors p-1 hover:bg-blue-500/10 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};