import React from 'react';
import { Zap, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface TokenBalanceProps {
  user: User;
  compact?: boolean;
}

/**
 * TokenBalance Component
 * Displays user's token balance with visual indicators
 * - Green: >= 50% balance (healthy)
 * - Yellow: 20-50% balance (warning)
 * - Red: < 20% balance (critical)
 */
export const TokenBalance: React.FC<TokenBalanceProps> = ({ user, compact = false }) => {
  const MONTHLY_QUOTA = 50000; // 50k tokens per month

  const tokenBalance = user.tokenBalance ?? 0;
  const tokenUsage = user.tokenUsageThisMonth ?? 0;
  const daysUntilReset = user.daysUntilReset ?? 0;

  // Calculate balance percentage
  const balancePercent = Math.min(100, Math.max(0, (tokenBalance / MONTHLY_QUOTA) * 100));

  // Determine color based on balance percentage
  const getBalanceColor = (): string => {
    if (balancePercent >= 50) return 'text-green-400';
    if (balancePercent >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (): string => {
    if (balancePercent >= 50) return 'bg-green-500';
    if (balancePercent >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const balanceColor = getBalanceColor();
  const progressColor = getProgressColor();
  const isLowBalance = balancePercent < 20;

  // Format numbers with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Compact mode: Icon + balance only (for mobile or condensed views)
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-black/30 rounded-lg border border-white/10">
        <Zap size={14} className={balanceColor} />
        <span className={`font-mono text-xs font-bold ${balanceColor}`}>
          {formatNumber(tokenBalance)}
        </span>
      </div>
    );
  }

  // Full mode: Complete panel with stats and progress bar
  return (
    <div className="px-4 py-3 bg-black/30 rounded-lg border border-white/10 space-y-3">
      {/* Header with balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className={balanceColor} />
          <span className="font-mono text-xs text-gray-400 uppercase tracking-wide">Token Balance</span>
        </div>
        <span className={`font-mono text-lg font-bold ${balanceColor}`}>
          {formatNumber(tokenBalance)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out`}
            style={{ width: `${balancePercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-gray-500">0</span>
          <span className="font-mono text-[10px] text-gray-500">{formatNumber(MONTHLY_QUOTA)}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
        {/* Usage This Month */}
        <div className="flex items-start gap-2">
          <TrendingDown size={14} className="text-blue-400 mt-0.5" />
          <div>
            <p className="font-mono text-[10px] text-gray-500 uppercase">Used</p>
            <p className="font-mono text-xs text-white font-semibold">{formatNumber(tokenUsage)}</p>
          </div>
        </div>

        {/* Days Until Reset */}
        <div className="flex items-start gap-2">
          <Calendar size={14} className="text-purple-400 mt-0.5" />
          <div>
            <p className="font-mono text-[10px] text-gray-500 uppercase">Reset</p>
            <p className="font-mono text-xs text-white font-semibold">
              {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>

      {/* Low Balance Warning */}
      {isLowBalance && (
        <div className="flex items-start gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-sans text-xs text-red-400 font-semibold">Low Balance</p>
            <p className="font-sans text-[10px] text-red-300/80 leading-tight mt-0.5">
              Your tokens are running low. Balance resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
