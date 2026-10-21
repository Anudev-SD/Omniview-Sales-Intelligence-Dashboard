import React, { useState, useEffect, useMemo } from 'react';
import { SaleTransaction, FilterState, PaymentMethod } from './types/sales';
import { INITIAL_TRANSACTIONS, parseSalesCsv } from './data/initialData';
import {
  filterTransactions,
  computeMetricSummary,
  computeProductStats,
  computePaymentStats,
  computeDailyTimeline,
  computeDayOfWeekStats
} from './utils/analytics';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KpiMetrics } from './components/KpiMetrics';
import { RevenueTimelineChart } from './components/RevenueTimelineChart';
import { ProductMatrixChart } from './components/ProductMatrixChart';
import { PaymentMethodDonutChart } from './components/PaymentMethodDonutChart';
import { ParetoAnalysisChart } from './components/ParetoAnalysisChart';
import { PriceVolumeScatterChart } from './components/PriceVolumeScatterChart';
import { DayOfWeekHeatmap } from './components/DayOfWeekHeatmap';
import { BasketCooccurrenceMatrix } from './components/BasketCooccurrenceMatrix';
import { TransactionLedgerTable } from './components/TransactionLedgerTable';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [transactions, setTransactions] = useState<SaleTransaction[]>(INITIAL_TRANSACTIONS);
  const [isCustomData, setIsCustomData] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'temporal' | 'ledger'>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
    selectedProducts: [],
    selectedPaymentMethods: [],
    minPrice: 50,
    maxPrice: 180
  });

  // Attempt to fetch fresh CSV from public assets if available
  useEffect(() => {
    fetch('/assets/aistudio/Sales_data_-_Sheet1_5e94d700.csv')
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error('Not found');
      })
      .then((csvText) => {
        const parsed = parseSalesCsv(csvText);
        if (parsed.length > 0) {
          setTransactions(parsed);
        }
      })
      .catch(() => {
        // Fallback to embedded INITIAL_TRANSACTIONS (already loaded)
      });
  }, []);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Catalog products and default prices
  const catalogProductDetails = useMemo(() => {
    const map = new Map<string, number>();
    INITIAL_TRANSACTIONS.forEach((t) => {
      if (!map.has(t.product)) map.set(t.product, t.price);
    });
    return Array.from(map.entries()).map(([name, defaultPrice]) => ({
      name,
      defaultPrice
    }));
  }, []);

  const allProducts = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.product));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  // Analytics Computations
  const summary = useMemo(() => {
    return computeMetricSummary(filteredTransactions);
  }, [filteredTransactions]);

  const productStats = useMemo(() => {
    return computeProductStats(filteredTransactions);
  }, [filteredTransactions]);

  const paymentStats = useMemo(() => {
    return computePaymentStats(filteredTransactions);
  }, [filteredTransactions]);

  const dailyStats = useMemo(() => {
    return computeDailyTimeline(filteredTransactions);
  }, [filteredTransactions]);

  const dayOfWeekStats = useMemo(() => {
    return computeDayOfWeekStats(filteredTransactions);
  }, [filteredTransactions]);

  // Handlers
  const handleToggleProduct = (productName: string) => {
    setFilters((prev) => {
      const exists = prev.selectedProducts.includes(productName);
      return {
        ...prev,
        selectedProducts: exists
          ? prev.selectedProducts.filter((p) => p !== productName)
          : [...prev.selectedProducts, productName]
      };
    });
  };

  const handleTogglePaymentMethod = (method: PaymentMethod) => {
    setFilters((prev) => {
      const exists = prev.selectedPaymentMethods.includes(method);
      return {
        ...prev,
        selectedPaymentMethods: exists
          ? prev.selectedPaymentMethods.filter((m) => m !== method)
          : [...prev.selectedPaymentMethods, method]
      };
    });
  };

  const handleAddTransaction = (newTx: SaleTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setIsCustomData(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setIsCustomData(true);
  };

  const handleImportCsv = (csvText: string) => {
    const parsed = parseSalesCsv(csvText);
    if (parsed.length > 0) {
      setTransactions(parsed);
      setIsCustomData(true);
    }
  };

  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setIsCustomData(false);
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetData={handleResetData}
        isCustomData={isCustomData}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Subtitle & Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Apparel Sales Intelligence Console
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Aug 15, 2025 – Oct 07, 2025</span>
              <span aria-hidden="true">·</span>
              <span>116 Historical Line Items</span>
              <span aria-hidden="true">·</span>
              <span>12 Catalog Styles</span>
              <span aria-hidden="true">·</span>
              <span>Omnichannel Checkout</span>
            </div>
          </div>

          {/* Quick tab switcher for mobile */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 font-medium rounded-md whitespace-nowrap ${
                activeTab === 'overview' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1 font-medium rounded-md whitespace-nowrap ${
                activeTab === 'products' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Products & Pareto
            </button>
            <button
              onClick={() => setActiveTab('temporal')}
              className={`px-3 py-1 font-medium rounded-md whitespace-nowrap ${
                activeTab === 'temporal' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Trends & Baskets
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1 font-medium rounded-md whitespace-nowrap ${
                activeTab === 'ledger' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Ledger
            </button>
          </div>
        </div>

        {/* Global Filter Toolbar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          allProducts={allProducts}
          totalRecordsCount={transactions.length}
          filteredCount={filteredTransactions.length}
          filteredRevenue={summary.totalRevenue}
        />

        {/* Executive KPI Metrics Ribbon (Always visible across all tabs) */}
        <KpiMetrics
          summary={summary}
          totalCatalogSize={transactions.length}
          filteredCount={filteredTransactions.length}
        />

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Primary Velocity Area Chart */}
            <RevenueTimelineChart dailyData={dailyStats} />

            {/* Split Grid: Product Matrix + Payment Gateway Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2">
                <ProductMatrixChart
                  productStats={productStats}
                  selectedProducts={filters.selectedProducts}
                  onToggleProduct={handleToggleProduct}
                />
              </div>

              <div className="lg:col-span-1">
                <PaymentMethodDonutChart
                  paymentStats={paymentStats}
                  selectedMethods={filters.selectedPaymentMethods}
                  onToggleMethod={handleTogglePaymentMethod}
                />
              </div>
            </div>

            {/* Secondary Insights Row: Price Elasticity Scatter + Basket Co-occurrence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <PriceVolumeScatterChart
                productStats={productStats}
                onSelectProduct={handleToggleProduct}
              />
              <BasketCooccurrenceMatrix transactions={filteredTransactions} />
            </div>
          </div>
        )}

        {/* Tab 2: Deep Product & Pareto Analytics */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Pareto 80/20 Analysis Chart */}
            <ParetoAnalysisChart productStats={productStats} />

            {/* 2-Column Product Deep Dive: Scatter Matrix + Horizontal Ranking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <PriceVolumeScatterChart
                productStats={productStats}
                onSelectProduct={handleToggleProduct}
              />

              <ProductMatrixChart
                productStats={productStats}
                selectedProducts={filters.selectedProducts}
                onToggleProduct={handleToggleProduct}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Temporal Trends & Basket Affinity */}
        {activeTab === 'temporal' && (
          <div className="space-y-6">
            {/* Day of Week Rhythm & Calendar Heatmap */}
            <DayOfWeekHeatmap
              dayOfWeekStats={dayOfWeekStats}
              dailyStats={dailyStats}
            />

            {/* Basket Co-occurrence and Multi-item Bundle Affinity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              <div className="lg:col-span-2">
                <RevenueTimelineChart dailyData={dailyStats} />
              </div>
              <div className="lg:col-span-1">
                <BasketCooccurrenceMatrix transactions={filteredTransactions} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Raw Normalized Transaction Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <TransactionLedgerTable
              transactions={filteredTransactions}
              onDeleteTransaction={handleDeleteTransaction}
              onImportCsv={handleImportCsv}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        catalogProducts={catalogProductDetails}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredTransactions={filteredTransactions}
        allTransactions={transactions}
      />
    </div>
  );
}
