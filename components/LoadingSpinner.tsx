import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-page flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Industrial Spinner */}
          <div className="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          {/* Center Dot */}
          <div className="w-2 h-2 bg-text-primary rounded-sm"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-text-primary font-sans font-bold text-lg tracking-tight uppercase">
            Carregando
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
            <span className="text-text-secondary font-mono text-xs tracking-widest">SYSTEM_INIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-800/50 rounded w-3/4" />
            <div className="h-4 bg-gray-800/50 rounded w-1/2" />
            <div className="h-4 bg-gray-800/50 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AgentsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse">
          <div className="h-64 bg-gray-800/30 rounded-2xl border border-gray-700/30" />
        </div>
      ))}
    </div>
  );
};
