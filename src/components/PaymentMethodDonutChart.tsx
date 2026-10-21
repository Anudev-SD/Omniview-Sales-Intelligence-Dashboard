import React, { useState } from 'react';
import { PaymentStat, PaymentMethod } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/analytics';
import { CreditCard, Wallet, Banknote, ShieldCheck } from 'lucide-react';

interface PaymentMethodDonutChartProps {
  paymentStats: PaymentStat[];
  selectedMethods: PaymentMethod[];
  onToggleMethod: (method: PaymentMethod) => void;
}

const METHOD_COLORS: Record<PaymentMethod, { fill: string; border: string; bg: string }> = {
  'Credit Card': { fill: '#6366f1', border: '#4f46e5', bg: 'bg-indigo-500' },
  'eWallet': { fill: '#14b8a6', border: '#0d9488', bg: 'bg-teal-500' },
  'Debit Card': { fill: '#8b5cf6', border: '#7c3aed', bg: 'bg-purple-500' },
  'Cash': { fill: '#f59e0b', border: '#d97706', bg: 'bg-amber-500' }
};

const METHOD_ICONS: Record<PaymentMethod, React.ComponentType<{ className?: string }>> = {
  'Credit Card': CreditCard,
  'eWallet': Wallet,
  'Debit Card': ShieldCheck,
  'Cash': Banknote
};

export const PaymentMethodDonutChart: React.FC<PaymentMethodDonutChartProps> = ({
  paymentStats,
  selectedMethods,
  onToggleMethod
}) => {
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);

  const totalRevenue = paymentStats.reduce((sum, s) => sum + s.revenue, 0);

  // SVG Geometry for Donut
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute slice stroke dash offsets
  let cumulativePercent = 0;
  const slices = paymentStats.map((stat) => {
    const percent = totalRevenue > 0 ? stat.revenue / totalRevenue : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativePercent * circumference;
    cumulativePercent += percent;

    return {
      stat,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color: METHOD_COLORS[stat.method] || { fill: '#94a3b8', border: '#64748b', bg: 'bg-slate-400' }
    };
  });

  const activeStat =
    hoveredMethod !== null
      ? paymentStats.find((s) => s.method === hoveredMethod)
      : paymentStats[0];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col h-full">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          Payment Gateway Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Volume split and average basket efficiency per channel
        </p>
      </div>

      {/* Donut & Stats Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90 select-none">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              className="dark:stroke-slate-800"
            />

            {/* Slices */}
            {slices.map(({ stat, strokeDasharray, strokeDashoffset, color }) => {
              const isHovered = hoveredMethod === stat.method;
              const isSelected = selectedMethods.includes(stat.method);
              return (
                <circle
                  key={stat.method}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={color.fill}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    opacity:
                      selectedMethods.length > 0 && !isSelected ? 0.35 : 1
                  }}
                  onMouseEnter={() => setHoveredMethod(stat.method)}
                  onMouseLeave={() => setHoveredMethod(null)}
                  onClick={() => onToggleMethod(stat.method)}
                />
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {activeStat ? (
              <>
                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[110px]">
                  {activeStat.method}
                </span>
                <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(activeStat.revenue)}
                </span>
                <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {formatPercent(activeStat.revenueShare)}
                </span>
              </>
            ) : (
              <span className="text-xs text-slate-400">No data</span>
            )}
          </div>
        </div>

        {/* Legend & Channel Comparison List */}
        <div className="space-y-2">
          {paymentStats.map((item) => {
            const isHovered = hoveredMethod === item.method;
            const isSelected = selectedMethods.includes(item.method);
            const Icon = METHOD_ICONS[item.method] || CreditCard;
            const color = METHOD_COLORS[item.method];

            return (
              <div
                key={item.method}
                onMouseEnter={() => setHoveredMethod(item.method)}
                onMouseLeave={() => setHoveredMethod(null)}
                onClick={() => onToggleMethod(item.method)}
                className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : isHovered
                    ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color.fill }}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.method}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>{item.units} txns ({formatPercent(item.revenueShare)})</span>
                  <span>Avg Basket: {formatCurrency(item.averageBasket)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
