import React from 'react';
import { BasketCooccurrence, SaleTransaction } from '../types/sales';
import { computeBasketCooccurrence, formatPercent } from '../utils/analytics';
import { PackageOpen, Sparkles, ArrowRight } from 'lucide-react';

interface BasketCooccurrenceMatrixProps {
  transactions: SaleTransaction[];
}

export const BasketCooccurrenceMatrix: React.FC<BasketCooccurrenceMatrixProps> = ({
  transactions
}) => {
  const cooccurrences = computeBasketCooccurrence(transactions);

  // Calculate order size distribution
  const orderSizeMap = new Map<string, number>();
  for (const t of transactions) {
    orderSizeMap.set(t.orderNumber, (orderSizeMap.get(t.orderNumber) || 0) + 1);
  }

  const singleItemOrders = Array.from(orderSizeMap.values()).filter((c) => c === 1).length;
  const multiItemOrders = Array.from(orderSizeMap.values()).filter((c) => c > 1).length;
  const totalOrders = orderSizeMap.size;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors flex flex-col h-full">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-indigo-600" />
          Basket Co-Occurrence & Bundle Affinity
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Frequently bundled products purchased together in the same order
        </p>
      </div>

      {/* Basket Distribution Mini Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
            Single Item Baskets
          </span>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-800 dark:text-white mt-1">
            {singleItemOrders}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({totalOrders > 0 ? formatPercent((singleItemOrders / totalOrders) * 100) : '0%'})
            </span>
          </div>
        </div>

        <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block font-medium">
            Multi-Item Bundles
          </span>
          <div className="text-lg font-bold font-mono tabular-nums text-indigo-950 dark:text-indigo-200 mt-1">
            {multiItemOrders}{' '}
            <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
              ({totalOrders > 0 ? formatPercent((multiItemOrders / totalOrders) * 100) : '0%'})
            </span>
          </div>
        </div>
      </div>

      {/* Pair Affinity List */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {cooccurrences.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6">
            No co-purchased bundles found in this filtered view.
          </div>
        ) : (
          cooccurrences.slice(0, 10).map((pair, idx) => (
            <div
              key={`${pair.productA}-${pair.productB}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <span className="font-mono text-slate-400 text-[10px] w-3">
                  {idx + 1}.
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {pair.productA}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                  {pair.productB}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 font-mono tabular-nums">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded text-[11px]">
                  {pair.cooccurrenceCount} bundle{pair.cooccurrenceCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Strategic Insight */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>
          Bundling recommendations: Pairing <em>Slim-Fit Denim Jeans</em> and <em>Classic Fit Chinos</em> drives higher order attachments.
        </span>
      </div>
    </div>
  );
};
