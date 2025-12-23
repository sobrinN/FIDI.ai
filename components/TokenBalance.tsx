import React from 'react';
import { Zap, TrendingDown, Calendar, AlertTriangle, Crown, Sparkles } from 'lucide-react';
import { User } from '../types';

interface TokenBalanceProps {
  user: User;
  compact?: boolean;
  onUpgradeClick?: () => void;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ user, compact = false, onUpgradeClick }) => {
  const creditBalance = user.creditBalance ?? 0;
  const creditUsage = user.creditUsageThisMonth ?? 0;
  const daysUntilReset = user.daysUntilReset ?? 0;
  const plan = user.plan ?? 'free';
  const monthlyAllowance = user.monthlyAllowance ?? 1000000;

  const balancePercent = Math.min(100, Math.max(0, (creditBalance / monthlyAllowance) * 100));

  // Determine color based on balance percentage (using standard colors for function)
  const getStatusColor = () => {
    if (balancePercent >= 50) return 'text-emerald-600 bg-emerald-600';
    if (balancePercent >= 20) return 'text-amber-500 bg-amber-500';
    return 'text-red-500 bg-red-500';
  };

  const statusColor = getStatusColor();
  const isLowBalance = balancePercent < 20;

  const showLowCreditWarning = creditBalance <= (plan === 'pro' ? 500000 : 50000);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR');
  };

  const PlanBadge = () => {
    if (plan === 'pro') {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 bg-black text-white border border-black rounded-sm">
          <Crown size={10} className="text-white" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Pro</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-sm">
        <Sparkles size={10} className="text-gray-500" />
        <span className="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-wider">Free</span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-sm shadow-sm">
        <div className={`w-2 h-2 rounded-full ${statusColor.split(' ')[1]}`} />
        <span className="font-mono text-xs font-bold text-text-primary">
          {showLowCreditWarning && <span title="Saldo baixo">! </span>}
          {formatNumber(creditBalance)}
        </span>
        <PlanBadge />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 bg-white border border-gray-200 rounded-sm shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest">Saldo Atual</span>
          <PlanBadge />
        </div>
        <div className="text-right">
          <span className="font-mono text-xl font-bold text-text-primary block leading-none">
            {formatNumber(creditBalance)}
          </span>
          <span className="font-mono text-[10px] text-text-secondary mt-1 block">
            / {formatNumber(monthlyAllowance)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-1 bg-gray-100 w-full">
          <div
            className={`h-full ${statusColor.split(' ')[1]} transition-all duration-500 ease-out`}
            style={{ width: `${balancePercent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <TrendingDown size={14} className="text-text-secondary mt-0.5" />
          <div>
            <p className="font-mono text-[9px] text-text-secondary uppercase">Usado</p>
            <p className="font-mono text-xs text-text-primary font-medium">{formatNumber(creditUsage)}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar size={14} className="text-text-secondary mt-0.5" />
          <div>
            <p className="font-mono text-[9px] text-text-secondary uppercase">Renovação</p>
            <p className="font-mono text-xs text-text-primary font-medium">
              {daysUntilReset} dias
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      {isLowBalance && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-100 rounded-sm">
          <AlertTriangle size={14} className="text-red-500" />
          <span className="font-sans text-xs text-red-600 font-medium">Saldo crítico</span>
        </div>
      )}

      {/* Upgrade CTA */}
      {plan === 'free' && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full py-2 px-4 bg-black text-white hover:bg-gray-800 border border-black rounded-sm transition-colors group"
        >
          <div className="flex items-center justify-center gap-2">
            <Crown size={14} className="text-accent" />
            <span className="font-sans text-xs font-bold uppercase tracking-wide">
              Upgrade Pro
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
