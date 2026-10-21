import React, { useState } from 'react';
import { ProductStat } from '../types/sales';
import { formatCurrency } from '../utils/analytics';
import { ScatterChart, HelpCircle } from 'lucide-react';

interface PriceVolumeScatterChartProps {
  productStats: ProductStat[];
  onSelectProduct: (productName: string) => void;
}

export const PriceVolumeScatterChart: React.FC<PriceVolumeScatterChartProps> = ({
  productStats,
  onSelectProduct
}) => {
  const [hoveredProduct, setHoveredProduct] = useState<ProductStat | null>(null);

  if (productStats.length === 0) {
    return null;
  }

  const width = 800;
  const height = 300;
  const padding = { top: 30, right: 40, bottom: 50, left: 60 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // X is Unit Price: min 50, max 190
  const minPrice = 50;
  const maxPrice = 190;

  // Y is Units Sold: min 0, max ceil(max(units) * 1.2)
  const maxUnits = Math.max(...productStats.map((p) => p.unitsSold), 15);
  const maxRevenue = Math.max(...productStats.map((p) => p.revenue), 1000);

  const getX = (price: number) => {
    return padding.left + ((price - minPrice) / (maxPrice - minPrice)) * innerWidth;
  };

  const getY = (units: number) => {
    return padding.top + innerHeight - (units / maxUnits) * innerHeight;
  };

  // Radius proportional to revenue
  const getRadius = (revenue: number) => {
    return 6 + Math.sqrt(revenue / maxRevenue) * 18;
  };

  const xTicks = [60, 80, 100, 120, 140, 160, 180];
  const yTicks = [0, 4, 8, 12, 16];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ScatterChart className="w-4 h-4 text-indigo-600" />
            Price Point vs. Sales Volume Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bubble size reflects total gross revenue generated
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-mono">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Click any bubble to inspect product</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredProduct(null)}
        >
          {/* Horizontal grid lines */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
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
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {val} units
                </text>
              </g>
            );
          })}

          {/* Vertical grid lines */}
          {xTicks.map((price) => {
            const x = getX(price);
            return (
              <g key={price}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                  className="dark:stroke-slate-800/60"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  ${price}
                </text>
              </g>
            );
          })}

          {/* Quadrant Guides / Subtext */}
          <text
            x={getX(70)}
            y={getY(13)}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-indigo-400/50 uppercase tracking-widest pointer-events-none"
          >
            High Volume Core
          </text>
          <text
            x={getX(160)}
            y={getY(11)}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-amber-500/50 uppercase tracking-widest pointer-events-none"
          >
            Premium Margin
          </text>

          {/* Bubbles */}
          {productStats.map((item) => {
            const cx = getX(item.unitPrice);
            const cy = getY(item.unitsSold);
            const r = getRadius(item.revenue);
            const isHovered = hoveredProduct?.product === item.product;

            return (
              <g
                key={item.product}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredProduct(item)}
                onClick={() => onSelectProduct(item.product)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  className={`transition-all duration-200 ${
                    item.unitPrice >= 140
                      ? isHovered
                        ? 'fill-amber-600/90 stroke-amber-700 stroke-2'
                        : 'fill-amber-500/70 stroke-amber-600/80 stroke-1'
                      : isHovered
                      ? 'fill-indigo-600/90 stroke-indigo-700 stroke-2'
                      : 'fill-indigo-500/70 stroke-indigo-600/80 stroke-1'
                  }`}
                />
                {/* Product label inside or beside bubble */}
                <text
                  x={cx}
                  y={cy - r - 4}
                  textAnchor="middle"
                  className={`text-[9px] font-medium pointer-events-none transition-colors ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {item.product.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Axis Titles */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-[11px] font-medium fill-slate-500"
          >
            Unit Price ($ USD)
          </text>
          <text
            x={20}
            y={padding.top + innerHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${padding.top + innerHeight / 2})`}
            className="text-[11px] font-medium fill-slate-500"
          >
            Units Sold (Volume)
          </text>
        </svg>

        {/* Hover Popover */}
        {hoveredProduct && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs backdrop-blur-sm border border-slate-700 min-w-[210px]"
            style={{
              left: `${Math.min(
                Math.max(10, (getX(hoveredProduct.unitPrice) / width) * 100),
                70
              )}%`,
              top: '15%'
            }}
          >
            <div className="font-semibold text-slate-100 border-b border-slate-700 pb-1 mb-1.5">
              {hoveredProduct.product}
            </div>
            <div className="space-y-1 font-mono tabular-nums text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Retail Price:</span>
                <span className="text-white">${hoveredProduct.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volume Sold:</span>
                <span className="text-slate-200">{hoveredProduct.unitsSold} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Revenue:</span>
                <span className="font-bold text-emerald-400">
                  {formatCurrency(hoveredProduct.revenue)}
                </span>
              </div>
              <div className="flex justify-between text-indigo-400 pt-1 border-t border-slate-800">
                <span>Revenue Share:</span>
                <span>{hoveredProduct.revenueShare.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
