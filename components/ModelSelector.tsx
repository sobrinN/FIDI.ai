import React from 'react';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { FREE_MODELS, PAID_MODELS, ModelInfo } from '../config/models';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (modelId: string | null) => void;
  disabled?: boolean;
  lockedReason?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  lockedReason
}) => {
  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
  };

  const renderModelOption = (model: ModelInfo, isSelected: boolean) => (
    <button
      key={model.id}
      onClick={() => handleModelSelect(model.id)}
      className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 group ${
        isSelected
          ? 'bg-gradient-to-r from-blue-500/30 to-blue-500/10 border border-blue-500/50 shadow-lg shadow-blue-500/10'
          : 'hover:bg-white/5 border border-white/10 hover:border-white/20'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className={`p-1.5 rounded-md ${
          isSelected ? 'bg-blue-500/20' : 'bg-white/5 group-hover:bg-white/10'
        }`}>
          <span className="text-lg flex-shrink-0">{model.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-sans font-bold text-white text-xs truncate">
              {model.displayName}
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${model.badgeColor}`}
            >
              {model.badge}
            </span>
          </div>
          <p className="font-sans text-[10px] text-gray-400 leading-tight mb-1 line-clamp-1">
            {model.description}
          </p>
          <p className="font-mono text-[9px] text-gray-600">{model.provider}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="relative flex flex-col h-full">
      {/* Scrollable Cards Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
        {/* FREE MODELS Section */}
        <div className="mb-4">
          <h3 className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl px-2 py-2 mb-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-blue-500/20">
            <span className="flex-1 text-green-400">Free Models</span>
            <span className="text-[8px] text-gray-500 normal-case bg-green-500/10 px-1.5 py-0.5 rounded">∞</span>
          </h3>
          <div className="space-y-2 px-1">
            {FREE_MODELS.map(model => (
              <motion.div
                key={model.id}
                layout
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {renderModelOption(model, selectedModel === model.id)}
              </motion.div>
            ))}
          </div>
        </div>

        {/* PAID MODELS Section */}
        <div>
          <h3 className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl px-2 py-2 mb-2 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 border-b border-blue-500/20">
            <span className="flex-1 text-yellow-400">Premium</span>
            <span className="text-[8px] text-gray-500 normal-case bg-yellow-500/10 px-1.5 py-0.5 rounded">1.5x</span>
          </h3>
          <div className="space-y-2 px-1">
            {PAID_MODELS.map(model => (
              <motion.div
                key={model.id}
                layout
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {renderModelOption(model, selectedModel === model.id)}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Disabled State Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-3 z-20">
          <div className="p-4 bg-gray-800/50 rounded-full">
            <Lock size={24} className="text-gray-400" />
          </div>
          <div className="text-center px-4">
            <p className="font-sans text-sm text-white font-semibold mb-1">Model Locked</p>
            <p className="font-mono text-xs text-gray-400">{lockedReason}</p>
          </div>
        </div>
      )}
    </div>
  );
};
