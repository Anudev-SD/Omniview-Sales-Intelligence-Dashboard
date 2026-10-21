import React, { useState } from 'react';
import { SaleTransaction } from '../types/sales';
import { exportTransactionsToCsv, downloadFile } from '../utils/analytics';
import { X, Download, Copy, Check, FileSpreadsheet, FileJson } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredTransactions: SaleTransaction[];
  allTransactions: SaleTransaction[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filteredTransactions,
  allTransactions
}) => {
  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dataset = exportScope === 'filtered' ? filteredTransactions : allTransactions;

  const getDataString = () => {
    if (exportFormat === 'csv') {
      return exportTransactionsToCsv(dataset);
    }
    return JSON.stringify(dataset, null, 2);
  };

  const handleDownload = () => {
    const data = getDataString();
    const ext = exportFormat === 'csv' ? 'csv' : 'json';
    const mime = exportFormat === 'csv' ? 'text/csv' : 'application/json';
    const filename = `sales_${exportScope}_export_${new Date().toISOString().split('T')[0]}.${ext}`;
    downloadFile(data, filename, mime);
  };

  const handleCopy = () => {
    const data = getDataString();
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Export Dataset & Reports
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Scope selection */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Export Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportScope('filtered')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  exportScope === 'filtered'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold">Current Filtered View</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {filteredTransactions.length} records selected
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  exportScope === 'all'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold">Full Master Dataset</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {allTransactions.length} total records
                </div>
              </button>
            </div>
          </div>

          {/* Format selection */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>CSV Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  exportFormat === 'json'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FileJson className="w-4 h-4 text-amber-600" />
                <span>Structured JSON</span>
              </button>
            </div>
          </div>

          {/* Preview Box */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Data Preview
            </label>
            <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono max-h-36 overflow-y-auto overflow-x-auto leading-relaxed border border-slate-800">
              {getDataString().split('\n').slice(0, 10).join('\n')}
              {'\n'}...
            </pre>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Data'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
