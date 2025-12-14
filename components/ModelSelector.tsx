import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Lock, Zap } from 'lucide-react';
import { FREE_MODELS, PAID_MODELS, getModelInfo, ModelInfo } from '../config/models';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (modelId: string | null) => void;
  disabled?: boolean;
  lockedReason?: string;
  defaultModel?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  lockedReason,
  defaultModel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current model info (selected or default)
  const currentModelId = selectedModel || defaultModel;
  const currentModelInfo = currentModelId ? getModelInfo(currentModelId) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  const handleUseDefault = () => {
    onModelChange(null);
    setIsOpen(false);
  };

  const renderModelOption = (model: ModelInfo, isSelected: boolean) => (
    <button
      key={model.id}
      onClick={() => handleModelSelect(model.id)}
      className={`w-full text-left p-3 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-500/20 border border-blue-500/50'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl flex-shrink-0">{model.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans font-semibold text-white text-sm truncate">
              {model.displayName}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${model.badgeColor}`}
            >
              {model.badge}
            </span>
          </div>
          <p className="font-sans text-xs text-gray-400 leading-tight mb-1">
            {model.description}
          </p>
          <p className="font-mono text-[10px] text-gray-500">{model.provider}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selector Button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border transition-all ${
          disabled
            ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed opacity-60'
            : 'bg-blue-900/20 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-900/30'
        }`}
        title={disabled ? lockedReason : 'Select AI model'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {disabled ? (
              <Lock size={16} className="text-gray-500 flex-shrink-0" />
            ) : (
              <Zap size={16} className="text-blue-400 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0 text-left">
              {currentModelInfo ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-sm text-white font-semibold truncate">
                      {currentModelInfo.displayName}
                    </span>
                    {!selectedModel && (
                      <span className="text-[10px] font-mono text-gray-500">(Agent Default)</span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-gray-400 truncate">
                    {currentModelInfo.costMultiplier === 0
                      ? 'Free - Unlimited usage'
                      : `${currentModelInfo.costMultiplier}x cost`}
                  </p>
                </>
              ) : (
                <span className="font-sans text-sm text-gray-400">Select a model</span>
              )}
            </div>
          </div>

          {!disabled && (
            <ChevronDown
              size={16}
              className={`text-gray-400 flex-shrink-0 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
          <div className="p-3">
            {/* Use Agent Default Option */}
            {defaultModel && (
              <>
                <div className="mb-3">
                  <button
                    onClick={handleUseDefault}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      !selectedModel
                        ? 'bg-blue-500/20 border border-blue-500/50'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-blue-400" />
                      <span className="font-sans text-sm text-white font-semibold">
                        Use Agent Default
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        ({getModelInfo(defaultModel)?.displayName || 'Default'})
                      </span>
                    </div>
                  </button>
                </div>
                <div className="border-t border-white/10 my-3"></div>
              </>
            )}

            {/* FREE MODELS Section */}
            <div className="mb-4">
              <h3 className="font-mono text-xs text-green-400 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                <span className="flex-1">Free Models</span>
                <span className="text-[10px] text-gray-500 normal-case">Unlimited</span>
              </h3>
              <div className="space-y-2">
                {FREE_MODELS.map(model => renderModelOption(model, selectedModel === model.id))}
              </div>
            </div>

            {/* PAID MODELS Section */}
            <div>
              <h3 className="font-mono text-xs text-yellow-400 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                <span className="flex-1">Premium Models</span>
                <span className="text-[10px] text-gray-500 normal-case">1.5x cost</span>
              </h3>
              <div className="space-y-2">
                {PAID_MODELS.map(model => renderModelOption(model, selectedModel === model.id))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
