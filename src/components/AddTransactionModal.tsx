import React, { useState } from 'react';
import { PaymentMethod, SaleTransaction } from '../types/sales';
import { X, PlusCircle } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: SaleTransaction) => void;
  catalogProducts: { name: string; defaultPrice: number }[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  catalogProducts
}) => {
  const [orderNumber, setOrderNumber] = useState('TT-1099');
  const [selectedProduct, setSelectedProduct] = useState(catalogProducts[0]?.name || 'Slim-Fit Denim Jeans');
  const [price, setPrice] = useState<number>(catalogProducts[0]?.defaultPrice || 88);
  const [date, setDate] = useState('2025-10-08');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');

  if (!isOpen) return null;

  const handleProductChange = (prodName: string) => {
    setSelectedProduct(prodName);
    const item = catalogProducts.find((p) => p.name === prodName);
    if (item) {
      setPrice(item.defaultPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    const newTx: SaleTransaction = {
      id: `custom-${Date.now()}`,
      orderNumber: orderNumber.trim(),
      product: selectedProduct,
      price: Number(price),
      date,
      paymentMethod
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Record New Apparel Sale
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Order Number
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Apparel Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {catalogProducts.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} (${p.defaultPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Credit Card', 'eWallet', 'Debit Card', 'Cash'] as PaymentMethod[]).map(
                (pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-colors ${
                      paymentMethod === pm
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pm}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors"
            >
              Add Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
