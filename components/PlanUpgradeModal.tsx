import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check, Zap, Image as ImageIcon, Video, MessageSquare, Loader2 } from 'lucide-react';
import { User } from '../types';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpgradeSuccess: (updatedUser: User) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentPlan = currentUser.plan || 'free';

  const handleUpgrade = async (targetPlan: 'free' | 'pro') => {
    if (targetPlan === currentPlan) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/upgrade-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ plan: targetPlan }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar plano');
      }

      const data = await response.json();
      onUpgradeSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar plano');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">Escolha Seu Plano</h2>
                  <p className="text-sm text-gray-400 mt-1">Selecione o plano ideal para suas necessidades</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Plans Grid */}
              <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    currentPlan === 'free'
                      ? 'bg-blue-500/10 border-blue-500'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  {currentPlan === 'free' && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                      <span className="text-xs text-blue-400 font-bold">Atual</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Sparkles size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Plano Grátis</h3>
                      <p className="text-sm text-gray-400">Para começar</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">100</span>
                      <span className="text-gray-400">tokens/mês</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">10 Imagens/mês</p>
                        <p className="text-xs text-gray-500">10 tokens por imagem</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">2 Vídeos/mês</p>
                        <p className="text-xs text-gray-500">50 tokens por vídeo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">Chat Ilimitado</p>
                        <p className="text-xs text-gray-500">~1 token por conversa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white">Acesso a todos os modelos</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade('free')}
                    disabled={loading || currentPlan === 'free'}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      currentPlan === 'free'
                        ? 'bg-blue-500/20 text-blue-400 cursor-default'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {currentPlan === 'free' ? 'Plano Atual' : 'Mudar para Grátis'}
                  </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    currentPlan === 'pro'
                      ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-yellow-500/50'
                  }`}
                >
                  {currentPlan === 'pro' && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                      <span className="text-xs text-yellow-400 font-bold">Atual</span>
                    </div>
                  )}

                  {currentPlan === 'free' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                      <span className="text-xs text-white font-bold uppercase tracking-wider">Recomendado</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                      <Crown size={24} className="text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Plano Pro</h3>
                      <p className="text-sm text-yellow-400">Para poder criar mais</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white">1.000</span>
                      <span className="text-gray-400">tokens/mês</span>
                    </div>
                    <p className="text-xs text-yellow-400/70 mt-1">10x mais tokens</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">100 Imagens/mês</p>
                        <p className="text-xs text-gray-500">10 tokens por imagem</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">20 Vídeos/mês</p>
                        <p className="text-xs text-gray-500">50 tokens por vídeo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">Chat Ilimitado</p>
                        <p className="text-xs text-gray-500">~1 token por conversa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white">Acesso prioritário</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white">Suporte premium</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgrade('pro')}
                    disabled={loading || currentPlan === 'pro'}
                    className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      currentPlan === 'pro'
                        ? 'bg-yellow-500/20 text-yellow-400 cursor-default'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Atualizando...</span>
                      </>
                    ) : currentPlan === 'pro' ? (
                      'Plano Atual'
                    ) : (
                      <>
                        <Crown size={16} />
                        <span>Fazer Upgrade para Pro</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Pricing Comparison */}
              <div className="px-6 pb-6">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-blue-400" />
                    Custo por Operação
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-start gap-2">
                      <ImageIcon size={14} className="text-pink-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Imagens</p>
                        <p className="text-gray-400">10 tokens</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Video size={14} className="text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Vídeos</p>
                        <p className="text-gray-400">50 tokens</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare size={14} className="text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Chat</p>
                        <p className="text-gray-400">~1 token</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
