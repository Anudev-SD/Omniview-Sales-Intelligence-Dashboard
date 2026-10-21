import React, { useState } from 'react';
import { ProductStat } from '../types/sales';
import { computeParetoAnalysis, formatCurrency, formatPercent } from '../utils/analytics';
import { Target, Info } from 'lucide-react';

interface ParetoAnalysisChartProps {
  productStats: ProductStat[];
}

export const ParetoAnalysisChart: React.FC<ParetoAnalysisChartProps> = ({ productStats }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const paretoData = computeParetoAnalysis(productStats);
  const totalRevenue = productStats.reduce((s, p) => s + p.revenue, 0);

  if (paretoData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
        No data for Pareto analysis.
      </div>
    );
  }

  // Chart layout dimensions
  const width = 800;
  const height = 320;
  const padding = { top: 30, right: 60, bottom: 60, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...paretoData.map((d) => d.revenue), 100);

  const getBarX = (index: number) => {
    const slotWidth = innerWidth / paretoData.length;
    return padding.left + index * slotWidth + slotWidth * 0.15;
  };

  const getBarWidth = () => {
    const slotWidth = innerWidth / paretoData.length;
    return slotWidth * 0.7;
  };

  const getBarY = (val: number) => {
    return padding.top + innerHeight - (val / maxRevenue) * innerHeight;
  };

  const getCumulativeY = (sharePercent: number) => {
    return padding.top + innerHeight - (sharePercent / 100) * innerHeight;
  };

  // Cumulative line points
  const linePoints = paretoData
    .map((d, i) => {
      const cx = getBarX(i) + getBarWidth() / 2;
      const cy = getCumulativeY(d.cumulativeShare);
      return `${cx},${cy}`;
    })
    .join(' ');

  // 80% cutoff line position
  const y80 = getCumulativeY(80);

  // How many items make up ~80%
  const items80Count = paretoData.filter((d) => d.isTop80).length;

  const activeItem = hoverIndex !== null ? paretoData[hoverIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            Pareto 80/20 Concentration Analysis
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify the vital few products generating 80% of total revenue
          </p>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            Top <strong className="font-mono text-indigo-600 dark:text-indigo-400">{items80Count}</strong> of{' '}
            <span className="font-mono">{paretoData.length}</span> products account for{' '}
            <strong className="font-mono">
              ~80%
            </strong>{' '}
            of revenue
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Background grid */}
          {[0, 20, 40, 60, 80, 100].map((pct) => {
            const y = getCumulativeY(pct);
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={pct === 80 ? '#ef4444' : '#e2e8f0'}
                  strokeDasharray={pct === 80 ? '4 2' : '3 3'}
                  strokeWidth={pct === 80 ? 1.5 : 1}
                  className={pct === 80 ? '' : 'dark:stroke-slate-800'}
                />
                {/* Right Y-axis (Percentage) */}
                <text
                  x={width - padding.right + 8}
                  y={y + 4}
                  className={`text-[10px] font-mono tabular-nums ${
                    pct === 80 ? 'fill-rose-500 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* 80% Cutoff Label */}
          <text
            x={width - padding.right - 8}
            y={y80 - 6}
            textAnchor="end"
            className="text-[10px] font-mono font-semibold fill-rose-500"
          >
            80% Revenue Cutoff
          </text>

          {/* Left Y-axis (Revenue) */}
          {[0, 0.5, 1].map((ratio) => {
            const val = maxRevenue * ratio;
            const y = getBarY(val);
            return (
              <text
                key={ratio}
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono tabular-nums fill-slate-400"
              >
                ${Math.round(val)}
              </text>
            );
          })}

          {/* Bars */}
          {paretoData.map((d, i) => {
            const x = getBarX(i);
            const y = getBarY(d.revenue);
            const barW = getBarWidth();
            const barH = padding.top + innerHeight - y;
            const isHovered = hoverIndex === i;

            return (
              <g
                key={d.product}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="3"
                  className={`transition-colors ${
                    isHovered
                      ? 'fill-indigo-700'
                      : d.isTop80
                      ? 'fill-indigo-500 dark:fill-indigo-600'
                      : 'fill-slate-300 dark:fill-slate-700'
                  }`}
                />
              </g>
            );
          })}

          {/* Cumulative Line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cumulative Line Dots */}
          {paretoData.map((d, i) => {
            const cx = getBarX(i) + getBarWidth() / 2;
            const cy = getCumulativeY(d.cumulativeShare);
            const isHovered = hoverIndex === i;

            return (
              <circle
                key={`dot-${d.product}`}
                cx={cx}
                cy={cy}
                r={isHovered ? 5 : 3.5}
                className={`transition-all ${
                  isHovered
                    ? 'fill-amber-500 stroke-white dark:stroke-slate-900 stroke-2'
                    : 'fill-amber-500'
                }`}
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* X-axis Labels */}
          {paretoData.map((d, i) => {
            const cx = getBarX(i) + getBarWidth() / 2;
            const shortName = d.product.split(' ')[0];

            return (
              <text
                key={`lbl-${d.product}`}
                x={cx}
                y={padding.top + innerHeight + 16}
                textAnchor="end"
                transform={`rotate(-40, ${cx}, ${padding.top + innerHeight + 16})`}
                className="text-[9px] font-mono fill-slate-500"
              >
                {shortName}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {activeItem && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs backdrop-blur-sm border border-slate-700 min-w-[220px]"
            style={{
              left: `${Math.min(
                Math.max(10, ((getBarX(hoverIndex) + getBarWidth() / 2) / width) * 100),
                70
              )}%`,
              top: '15%'
            }}
          >
            <div className="font-semibold text-slate-100 border-b border-slate-700 pb-1 mb-1.5">
              {activeItem.product}
            </div>
            <div className="space-y-1 font-mono tabular-nums text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Product Revenue:</span>
                <span className="font-bold text-indigo-400">
                  {formatCurrency(activeItem.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cumulative Revenue:</span>
                <span className="text-amber-400">
                  {formatCurrency(activeItem.cumulativeRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cumulative Share:</span>
                <span className="font-semibold text-white">
                  {formatPercent(activeItem.cumulativeShare)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Core 80% Tier:</span>
                <span className={activeItem.isTop80 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {activeItem.isTop80 ? 'Yes (Vital 80%)' : 'Secondary Long-Tail'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-indigo-500 rounded-sm" />
            <span>Product Revenue ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded-full" />
            <span>Cumulative % Curve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 rounded-full border-dashed" />
            <span>80% Boundary</span>
          </div>
        </div>
        <span className="font-mono text-[11px]">
          Total Volume: {formatCurrency(totalRevenue)}
        </span>
      </div>
    </div>
  );
};
