import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AGENTS } from '../config/agents';

interface AgentsPageProps {
  onBack: () => void;
}

// Agent descriptions for marketing page
const agentDescriptions: Record<string, string> = {
  '01': 'Agente de programação que faz. Age de forma eficiente, organizada e minimalista.',
  '02': 'Agente de criação e edição de textos em geral. Age de forma precisa na escrita em vários segmentos.',
  '03': 'Agente de organização para manter seu trabalho em dia. Age de forma sistemática focado na organização dos seus projetos.',
  '04': 'Agente de design para trazer suas histórias e projetos a vida. Age de forma criativa para ilustrar e animar.',
};

export const AgentsPage: React.FC<AgentsPageProps> = ({ onBack }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-6 relative overflow-hidden flex flex-col">
      {/* Schematic Background Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full">
           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
           </pattern>
           <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="container mx-auto z-10 mb-12 flex justify-between items-center">
        <motion.button
          onClick={onBack}
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 rounded-lg transition-all text-white"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} className="group-hover:text-blue-400 transition-colors" />
          <span className="font-mono text-sm">VOLTAR</span>
        </motion.button>

        <div className="text-right">
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            AGENTES IA
          </h1>
          <p className="font-mono text-xs text-blue-400 mt-1 tracking-wider">
            SISTEMAS ESPECIALIZADOS
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto z-10 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {Object.values(AGENTS).map((agent) => {
          const Icon = agent.icon;
          const isSelected = selectedAgent === agent.id;

          return (
            <motion.div
              key={agent.id}
              className={`group relative bg-black/40 backdrop-blur-md border rounded-2xl p-8 cursor-pointer transition-all duration-500 ${
                isSelected
                  ? `${agent.borderColor} shadow-2xl`
                  : 'border-white/10 hover:border-white/30'
              }`}
              onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
              whileHover={{ y: -4, scale: 1.02 }}
              layout
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${agent.bgGradient} to-black/50 border ${agent.borderColor}`}>
                    <Icon className={`w-8 h-8 ${agent.color}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white mb-1">
                      {agent.name}
                    </h3>
                    <p className={`font-mono text-xs ${agent.color} uppercase tracking-wider`}>
                      {agent.role}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs text-gray-500">
                  ID: {agent.id}
                </span>
              </div>

              {/* Agent Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {agentDescriptions[agent.id]}
              </p>

              {/* Model Info */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="font-mono text-xs text-gray-500">
                  MODEL
                </span>
                <span className={`font-mono text-xs ${agent.color}`}>
                  {agent.model.split('/')[1]?.split(':')[0] || agent.model}
                </span>
              </div>

              {/* Expand Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-white/10"
                  >
                    <p className="text-xs text-gray-400 font-mono leading-relaxed whitespace-pre-line">
                      {agent.systemPrompt.substring(0, 200)}...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="container mx-auto z-10 mt-12 text-center">
        <p className="font-mono text-xs text-gray-500">
          Todos os agentes são alimentados por modelos de linguagem de última geração
        </p>
      </div>
    </div>
  );
};
