import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-blue-400 font-mono text-sm animate-pulse">
          Carregando...
        </p>
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
