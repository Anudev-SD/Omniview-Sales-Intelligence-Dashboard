import React, { useState, useMemo } from 'react';
import { DailyStat } from '../types/sales';
import { formatCurrency, formatNumber } from '../utils/analytics';
import { TrendingUp, BarChart2, Layers } from 'lucide-react';

interface RevenueTimelineChartProps {
  dailyData: DailyStat[];
}

export const RevenueTimelineChart: React.FC<RevenueTimelineChartProps> = ({ dailyData }) => {
  const [metric, setMetric] = useState<'revenue' | 'units' | 'orderCount'>('revenue');
  const [showMovingAvg, setShowMovingAvg] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compute 7-day rolling moving average
  const chartData = useMemo(() => {
    return dailyData.map((d, i) => {
      const windowStart = Math.max(0, i - 6);
      const windowSlice = dailyData.slice(windowStart, i + 1);
      const sum = windowSlice.reduce((acc, curr) => acc + curr[metric], 0);
      const movingAvg = sum / windowSlice.length;

      return {
        ...d,
        movingAvg
      };
    });
  }, [dailyData, metric]);

  if (dailyData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
        No sales recorded for the selected filter range.
      </div>
    );
  }

  // Chart layout dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    ...chartData.map((d) => Math.max(d[metric], showMovingAvg ? d.movingAvg : 0)),
    10
  );

  // Scale functions
  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const getY = (value: number) => {
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  };

  // Generate SVG path for primary metric line
  const points = chartData.map((d, i) => `${getX(i)},${getY(d[metric])}`).join(' ');
  const areaPoints = `${getX(0)},${padding.top + innerHeight} ${points} ${getX(
    chartData.length - 1
  )},${padding.top + innerHeight}`;

  // Generate SVG path for moving average line
  const movingAvgPoints = chartData
    .map((d, i) => `${getX(i)},${getY(d.movingAvg)}`)
    .join(' ');

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => pct * maxValue);

  // X-axis label selection (show ~6-8 evenly spaced labels)
  const xTickIndices = useMemo(() => {
    const count = Math.min(chartData.length, 7);
    const step = Math.max(1, Math.floor(chartData.length / count));
    const indices: number[] = [];
    for (let i = 0; i < chartData.length; i += step) {
      indices.push(i);
    }
    if (indices[indices.length - 1] !== chartData.length - 1) {
      indices.push(chartData.length - 1);
    }
    return indices;
  }, [chartData]);

  const activeItem = hoverIndex !== null ? chartData[hoverIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Revenue & Sales Volume Velocity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Daily timeline with dynamic trend analysis across the billing cycle
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metric === 'revenue'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Revenue ($)
            </button>
            <button
              onClick={() => setMetric('units')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metric === 'units'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Units (pcs)
            </button>
            <button
              onClick={() => setMetric('orderCount')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metric === 'orderCount'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Orders
            </button>
          </div>

          {/* 7-day MA Toggle */}
          <button
            onClick={() => setShowMovingAvg(!showMovingAvg)}
            className={`px-2.5 py-1 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap ${
              showMovingAvg
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            7-Day Avg
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Labels */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  className="dark:stroke-slate-800"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono tabular-nums fill-slate-400"
                >
                  {metric === 'revenue' ? `$${Math.round(val)}` : Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <polygon points={areaPoints} fill="url(#areaGradient)" />

          {/* Primary Trend Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Moving Average Line (Amber) */}
          {showMovingAvg && (
            <polyline
              points={movingAvgPoints}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Data Points */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d[metric]);
            const isHovered = hoverIndex === i;
            return (
              <g key={d.date}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 2.5}
                  className={`transition-all ${
                    isHovered
                      ? 'fill-indigo-600 stroke-white dark:stroke-slate-900 stroke-2'
                      : 'fill-indigo-500'
                  }`}
                />
                {/* Transparent hover capture column */}
                <rect
                  x={cx - (innerWidth / chartData.length) / 2}
                  y={padding.top}
                  width={innerWidth / chartData.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}

          {/* Vertical Crosshair Guide */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + innerHeight}
              stroke="#94a3b8"
              strokeDasharray="2 2"
              strokeWidth="1.5"
            />
          )}

          {/* X-axis Labels */}
          {xTickIndices.map((idx) => {
            const item = chartData[idx];
            if (!item) return null;
            const x = getX(idx);
            // format '2025-08-15' -> 'Aug 15'
            const parts = item.date.split('-');
            const label = `${['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(parts[1], 10)]} ${parseInt(parts[2], 10)}`;

            return (
              <text
                key={idx}
                x={x}
                y={padding.top + innerHeight + 20}
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400"
              >
                {label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {activeItem && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs backdrop-blur-sm border border-slate-700 min-w-[200px]"
            style={{
              left: `${Math.min(
                Math.max(10, (getX(hoverIndex) / width) * 100),
                75
              )}%`,
              top: '10%'
            }}
          >
            <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
              <span>{activeItem.date}</span>
              <span className="font-mono tabular-nums text-indigo-400">
                {activeItem.orderCount} order{activeItem.orderCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-1 font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Revenue:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(activeItem.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Units Sold:</span>
                <span className="text-slate-200">{activeItem.units} pcs</span>
              </div>
              {showMovingAvg && (
                <div className="flex justify-between text-amber-300">
                  <span className="text-amber-300/80">7-Day Rolling Avg:</span>
                  <span>
                    {metric === 'revenue'
                      ? formatCurrency(activeItem.movingAvg)
                      : activeItem.movingAvg.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Payment channel breakdown for this day */}
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] grid grid-cols-2 gap-1 text-slate-300 font-mono">
              {activeItem.creditCard > 0 && (
                <div>Card: ${activeItem.creditCard}</div>
              )}
              {activeItem.eWallet > 0 && (
                <div>eWallet: ${activeItem.eWallet}</div>
              )}
              {activeItem.debitCard > 0 && (
                <div>Debit: ${activeItem.debitCard}</div>
              )}
              {activeItem.cash > 0 && <div>Cash: ${activeItem.cash}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-600 rounded-full" />
            <span>Daily Actual</span>
          </div>
          {showMovingAvg && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 rounded-full border-dashed" />
              <span>7-Day Moving Average</span>
            </div>
          )}
        </div>
        <div className="text-[11px] font-mono">
          Span: {chartData[0]?.date} → {chartData[chartData.length - 1]?.date} ({chartData.length} active days)
        </div>
      </div>
    </div>
  );
};
