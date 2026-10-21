export type PaymentMethod = 'Credit Card' | 'eWallet' | 'Cash' | 'Debit Card';

export interface SaleTransaction {
  id: string;
  orderNumber: string;
  product: string;
  price: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
}

export interface FilterState {
  searchQuery: string;
  dateRange: 'all' | 'aug' | 'sep' | 'oct' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  selectedProducts: string[];
  selectedPaymentMethods: PaymentMethod[];
  minPrice: number;
  maxPrice: number;
}

export interface MetricSummary {
  totalRevenue: number;
  totalUnits: number;
  uniqueOrders: number;
  averageOrderValue: number;
  averageUnitPrice: number;
  multiItemOrderCount: number;
  multiItemOrderRate: number;
  topProductByRevenue: { name: string; revenue: number; units: number };
  topPaymentMethod: { method: PaymentMethod; share: number; revenue: number };
}

export interface ProductStat {
  product: string;
  unitPrice: number;
  unitsSold: number;
  revenue: number;
  revenueShare: number;
  orderCount: number;
}

export interface PaymentStat {
  method: PaymentMethod;
  revenue: number;
  units: number;
  orders: number;
  averageBasket: number;
  revenueShare: number;
}

export interface DailyStat {
  date: string;
  revenue: number;
  units: number;
  orderCount: number;
  creditCard: number;
  eWallet: number;
  cash: number;
  debitCard: number;
}

export interface DayOfWeekStat {
  dayName: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday...
  revenue: number;
  units: number;
  orders: number;
}

export interface BasketCooccurrence {
  productA: string;
  productB: string;
  cooccurrenceCount: number;
}
