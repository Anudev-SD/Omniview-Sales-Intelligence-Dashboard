import React from 'react';
import { MetricSummary } from '../types/sales';
import { formatCurrency, formatNumber, formatPercent } from '../utils/analytics';
import { TrendingUp, ShoppingBag, CreditCard, Layers, Tag, DollarSign } from 'lucide-react';

interface KpiMetricsProps {
  summary: MetricSummary;
  totalCatalogSize: number;
  filteredCount: number;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  summary,
  totalCatalogSize,
  filteredCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Gross Revenue */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Gross Revenue</span>
          <DollarSign className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatCurrency(summary.totalRevenue)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>Avg Unit:</span>{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatCurrency(summary.averageUnitPrice)}
          </span>
        </div>
      </div>

      {/* Units Sold */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Units Sold</span>
          <ShoppingBag className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatNumber(summary.totalUnits)}
        </div>
        <div className="mt-1 text-xs text-slate-500 truncate">
          <span>{filteredCount} of {totalCatalogSize} records</span>
        </div>
      </div>

      {/* Unique Orders */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Distinct Orders</span>
          <Layers className="w-4 h-4 text-sky-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatNumber(summary.uniqueOrders)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span>AOV:</span>{' '}
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatCurrency(summary.averageOrderValue)}
          </span>
        </div>
      </div>

      {/* Multi-item Basket Rate */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Multi-Item Rate</span>
          <TrendingUp className="w-4 h-4 text-violet-600" />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatPercent(summary.multiItemOrderRate)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          <span className="font-mono tabular-nums font-semibold text-slate-800">{summary.multiItemOrderCount}</span> multi-product orders
        </div>
      </div>

      {/* Top Product */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Top Product</span>
          <Tag className="w-4 h-4 text-amber-600" />
        </div>
        <div
          title={summary.topProductByRevenue.name}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate"
        >
          {summary.topProductByRevenue.name}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatCurrency(summary.topProductByRevenue.revenue)}
          </span>
          <span>·</span>
          <span>{summary.topProductByRevenue.units} pcs</span>
        </div>
      </div>

      {/* Top Payment Gateway */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-300">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Top Channel</span>
          <CreditCard className="w-4 h-4 text-teal-600" />
        </div>
        <div className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
          {summary.topPaymentMethod.method}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-mono tabular-nums font-semibold text-slate-800">
            {formatPercent(summary.topPaymentMethod.share)}
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums">
            {formatCurrency(summary.topPaymentMethod.revenue)}
          </span>
        </div>
      </div>
    </div>
  );
};
