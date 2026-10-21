import React, { useState, useMemo } from 'react';
import { SaleTransaction } from '../types/sales';
import { formatCurrency, exportTransactionsToCsv, downloadFile } from '../utils/analytics';
import {
  ArrowUpDown,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  Table
} from 'lucide-react';

interface TransactionLedgerTableProps {
  transactions: SaleTransaction[];
  onDeleteTransaction?: (id: string) => void;
  onImportCsv: (csvText: string) => void;
}

type SortField = 'orderNumber' | 'product' | 'price' | 'date' | 'paymentMethod';

export const TransactionLedgerTable: React.FC<TransactionLedgerTableProps> = ({
  transactions,
  onDeleteTransaction,
  onImportCsv
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [copied, setCopied] = useState(false);

  // Sorting
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comp = 0;
      if (sortField === 'price') {
        comp = a.price - b.price;
      } else {
        comp = a[sortField].localeCompare(b[sortField]);
      }
      return sortAsc ? comp : -comp;
    });
  }, [transactions, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleCopy = () => {
    const csv = exportTransactionsToCsv(transactions);
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const csv = exportTransactionsToCsv(transactions);
    downloadFile(csv, `sales_ledger_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportCsv(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-600" />
            Normalized Transaction Ledger
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit-grade line items with live sorting, clipboard copy, and CSV import
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* CSV File Import */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase font-medium text-[11px] tracking-wider select-none">
            <tr>
              <th
                onClick={() => toggleSort('orderNumber')}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Order #</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('product')}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Product</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('price')}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('date')}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('paymentMethod')}
                className="px-3.5 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Payment Gateway</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              {onDeleteTransaction && (
                <th className="px-3.5 py-2.5 text-center w-12">Action</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono tabular-nums">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-sans">
                  No transaction records match the current filters.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-3.5 py-2 text-indigo-600 dark:text-indigo-400 font-semibold whitespace-nowrap">
                    {tx.orderNumber}
                  </td>
                  <td className="px-3.5 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                    {tx.product}
                  </td>
                  <td className="px-3.5 py-2 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(tx.price)}
                  </td>
                  <td className="px-3.5 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="px-3.5 py-2 font-sans text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {tx.paymentMethod}
                  </td>
                  {onDeleteTransaction && (
                    <td className="px-3.5 py-2 text-center">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-300 font-mono"
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={150}>All (116+)</option>
          </select>
          <span className="font-mono tabular-nums">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedTransactions.length)} of {sortedTransactions.length}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
