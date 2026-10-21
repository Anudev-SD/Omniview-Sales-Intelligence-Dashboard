import React, { useState } from 'react';
import { ProductStat } from '../types/sales';
import { formatCurrency, formatPercent } from '../utils/analytics';
import { ShoppingBag, ArrowUpDown, Filter } from 'lucide-react';

interface ProductMatrixChartProps {
  productStats: ProductStat[];
  selectedProducts: string[];
  onToggleProduct: (productName: string) => void;
}

export const ProductMatrixChart: React.FC<ProductMatrixChartProps> = ({
  productStats,
  selectedProducts,
  onToggleProduct
}) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'unitsSold' | 'unitPrice'>('revenue');

  const sortedStats = [...productStats].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'unitsSold') return b.unitsSold - a.unitsSold;
    return b.unitPrice - a.unitPrice;
  });

  const maxVal = Math.max(...sortedStats.map((s) => s[sortBy]), 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col h-full">
      {/* Title & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
            Product Catalog Performance Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any row to filter entire dashboard to that apparel item
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <span className="px-2 text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" />
            Sort:
          </span>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'revenue'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSortBy('unitsSold')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'unitsSold'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setSortBy('unitPrice')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              sortBy === 'unitPrice'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Price
          </button>
        </div>
      </div>

      {/* Product Rows */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {sortedStats.map((item, index) => {
          const isSelected = selectedProducts.includes(item.product);
          const barWidthPercent = (item[sortBy] / maxVal) * 100;

          return (
            <div
              key={item.product}
              onClick={() => onToggleProduct(item.product)}
              className={`group cursor-pointer rounded-lg p-2.5 border transition-all ${
                isSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60'
              }`}
            >
              {/* Product Info Header */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-400 text-[11px] w-4 shrink-0">
                    {index + 1}.
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.product}
                  </span>
                  <span className="text-slate-400 hidden sm:inline">·</span>
                  <span className="text-slate-500 font-mono tabular-nums text-[11px] hidden sm:inline">
                    ${item.unitPrice.toFixed(2)}/unit
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {item.unitsSold} sold
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                  <span className="text-slate-400 text-[11px] w-12 text-right">
                    {formatPercent(item.revenueShare)}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-indigo-600'
                      : index === 0
                      ? 'bg-indigo-600'
                      : index < 3
                      ? 'bg-indigo-500'
                      : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Filter className="w-3 h-3" />
          {selectedProducts.length > 0
            ? `${selectedProducts.length} product(s) active in filter`
            : 'All 12 apparel products displayed'}
        </span>
        <span className="font-mono">
          Total: {formatCurrency(sortedStats.reduce((s, x) => s + x.revenue, 0))}
        </span>
      </div>
    </div>
  );
};
