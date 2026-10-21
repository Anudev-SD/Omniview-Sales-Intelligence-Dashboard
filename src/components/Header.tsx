import React from 'react';
import { Download, Plus, RefreshCw, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'products' | 'temporal' | 'ledger';
  setActiveTab: (tab: 'overview' | 'products' | 'temporal' | 'ledger') => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onResetData: () => void;
  isCustomData: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenExportModal,
  onResetData,
  isCustomData,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              OV
            </div>
            <a
              href="#top"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              OmniView Analytics
            </a>
          </div>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                activeTab === 'overview'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                activeTab === 'products'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Product & Pareto
            </button>
            <button
              onClick={() => setActiveTab('temporal')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                activeTab === 'temporal'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Trends & Baskets
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                activeTab === 'ledger'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Data Ledger
            </button>
          </nav>

          {/* Zone 3: Primary action + secondary utility toggles */}
          <div className="flex items-center gap-3 shrink-0">
            {isCustomData && (
              <button
                onClick={onResetData}
                title="Reset to default dataset"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap shrink-0">Reset Data</span>
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenExportModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
