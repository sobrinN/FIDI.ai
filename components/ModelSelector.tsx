import React from 'react';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FREE_MODELS, PAID_MODELS, ModelInfo } from '../config/models';

interface ModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (modelId: string | null) => void;
  disabled?: boolean;
  lockedReason?: string;
  onMediaClick?: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
  lockedReason,
  onMediaClick
}) => {
  const [activeCategory, setActiveCategory] = React.useState<'free' | 'paid' | null>(null);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
  };

  const isFreeSelected = selectedModel ? FREE_MODELS.some(m => m.id === selectedModel) : false;
  const isPaidSelected = selectedModel ? PAID_MODELS.some(m => m.id === selectedModel) : false;

  const renderModelOption = (model: ModelInfo, isSelected: boolean) => (
    <button
      key={model.id}
      onClick={() => !disabled && handleModelSelect(model.id)}
      disabled={disabled}
      title={disabled ? lockedReason : undefined}
      className={`w-full text-left p-3 rounded-sm transition-all duration-200 group border text-text-primary ${isSelected
        ? 'bg-black text-white border-black'
        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={`font-sans font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-text-primary'}`}>
              {model.displayName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono ${isSelected ? 'text-gray-400' : 'text-text-secondary'}`}>
              {model.provider}
            </span>
          </div>
        </div>
      </div>
    </button>
  );

  const renderCategoryButton = (
    type: 'free' | 'paid',
    title: string,
    subtitle: string,
    isSelected: boolean,
    models: readonly ModelInfo[]
  ) => {
    const currentModelName = isSelected ? models.find(m => m.id === selectedModel)?.displayName : null;

    return (
      <button
        onClick={() => !disabled && setActiveCategory(type)}
        disabled={disabled}
        title={disabled ? lockedReason : undefined}
        className={`w-full group relative rounded-sm border transition-all duration-200 p-4 text-left ${isSelected
          ? 'bg-white border-black shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-text-primary">
              {title}
            </span>
            {isSelected && (
              <div className="w-2 h-2 rounded-full bg-accent" />
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-text-secondary">{subtitle}</span>
            <span className="text-[10px] font-mono text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded-sm">
              {models.length}
            </span>
          </div>

          {isSelected && currentModelName && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-text-primary font-medium truncate">
              {currentModelName}
            </div>
          )}
        </div>

        {!isSelected && (
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
        )}
      </button>
    );
  };

  const renderModelList = (models: readonly ModelInfo[], title: string) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveCategory(null)}
          className="p-1 rounded-sm hover:bg-gray-200 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
          {title}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {models.map(model => renderModelOption(model, selectedModel === model.id))}
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col h-full">
      <AnimatePresence mode="wait" initial={false}>
        {!activeCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 h-full overflow-y-auto pt-1"
          >
            {renderCategoryButton('free', 'Gratuito', 'Uso ilimitado', isFreeSelected, FREE_MODELS)}
            {renderCategoryButton('paid', 'Premium', 'Alta performance', isPaidSelected, PAID_MODELS)}

            {onMediaClick && (
              <button
                onClick={onMediaClick}
                className="w-full group relative rounded-sm border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-text-primary">
                    Canvas
                  </span>
                  <Palette size={14} className="text-text-secondary" />
                </div>
                <div className="text-[10px] text-text-secondary mt-1">
                  Gerar Mídia
                </div>
              </button>
            )}

          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeCategory === 'free'
              ? renderModelList(FREE_MODELS, 'Modelos Gratuitos')
              : renderModelList(PAID_MODELS, 'Premium')
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
