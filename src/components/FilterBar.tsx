import React, { useState } from 'react';
import { FilterState, PaymentMethod } from '../types/sales';
import { Search, X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  allProducts: string[];
  totalRecordsCount: number;
  filteredCount: number;
  filteredRevenue: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  allProducts,
  totalRecordsCount,
  filteredCount,
  filteredRevenue
}) => {
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const paymentMethods: PaymentMethod[] = ['Credit Card', 'eWallet', 'Debit Card', 'Cash'];

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.dateRange !== 'all' ||
    filters.selectedProducts.length > 0 ||
    filters.selectedPaymentMethods.length > 0 ||
    filters.minPrice > 50 ||
    filters.maxPrice < 180;

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      dateRange: 'all',
      customStartDate: '',
      customEndDate: '',
      selectedProducts: [],
      selectedPaymentMethods: [],
      minPrice: 50,
      maxPrice: 180
    });
  };

  const toggleProduct = (prod: string) => {
    setFilters((prev) => {
      const exists = prev.selectedProducts.includes(prod);
      return {
        ...prev,
        selectedProducts: exists
          ? prev.selectedProducts.filter((p) => p !== prod)
          : [...prev.selectedProducts, prod]
      };
    });
  };

  const togglePaymentMethod = (pm: PaymentMethod) => {
    setFilters((prev) => {
      const exists = prev.selectedPaymentMethods.includes(pm);
      return {
        ...prev,
        selectedPaymentMethods: exists
          ? prev.selectedPaymentMethods.filter((m) => m !== pm)
          : [...prev.selectedPaymentMethods, pm]
      };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm transition-colors space-y-3">
      {/* Top Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order #, product, date, payment..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Presets Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, dateRange: 'all' }))}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.dateRange === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All Dates
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, dateRange: 'aug' }))}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.dateRange === 'aug'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Aug 2025
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, dateRange: 'sep' }))}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.dateRange === 'sep'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Sep 2025
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, dateRange: 'oct' }))}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.dateRange === 'oct'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Oct 2025
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, dateRange: 'custom' }))}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.dateRange === 'custom'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Product Filter Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap ${
              filters.selectedProducts.length > 0
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>Products</span>
            {filters.selectedProducts.length > 0 && (
              <span className="font-mono tabular-nums text-xs font-semibold">
                ({filters.selectedProducts.length})
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
          </button>

          {isProductMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProductMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-2 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span>Filter by Product</span>
                  {filters.selectedProducts.length > 0 && (
                    <button
                      onClick={() => setFilters((p) => ({ ...p, selectedProducts: [] }))}
                      className="text-indigo-600 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {allProducts.map((prod) => {
                  const isChecked = filters.selectedProducts.includes(prod);
                  return (
                    <button
                      key={prod}
                      onClick={() => toggleProduct(prod)}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                      <span className="truncate pr-2">{prod}</span>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            showAdvanced
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
          )}
        </button>

        {/* Clear All Reset button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap shrink-0"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Custom Date Range Picker (shown when custom is selected) */}
      {filters.dateRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">Date Range:</span>
          <input
            type="date"
            value={filters.customStartDate || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, customStartDate: e.target.value }))
            }
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-xs"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={filters.customEndDate || ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, customEndDate: e.target.value }))
            }
            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 font-mono text-xs"
          />
        </div>
      )}

      {/* Advanced Filter Expansion (Payment Methods & Price Slider) */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Method toggles */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((pm) => {
                const active = filters.selectedPaymentMethods.includes(pm);
                return (
                  <button
                    key={pm}
                    onClick={() => togglePaymentMethod(pm)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {pm}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Price Range</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                ${filters.minPrice} — ${filters.maxPrice}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: Math.min(Number(e.target.value), prev.maxPrice - 5)
                  }))
                }
                className="w-full accent-indigo-600"
              />
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: Math.max(Number(e.target.value), prev.minPrice + 5)
                  }))
                }
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Status Text Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{filteredCount}</strong> of{' '}
            <span className="font-mono tabular-nums">{totalRecordsCount}</span> transactions
          </span>
          <span>·</span>
          <span>
            Total Volume:{' '}
            <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
              ${filteredRevenue.toFixed(2)}
            </strong>
          </span>
        </div>

        {hasActiveFilters && (
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
};
