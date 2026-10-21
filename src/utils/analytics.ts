import {
  SaleTransaction,
  FilterState,
  MetricSummary,
  ProductStat,
  PaymentStat,
  DailyStat,
  DayOfWeekStat,
  BasketCooccurrence,
  PaymentMethod
} from '../types/sales';

export function filterTransactions(
  transactions: SaleTransaction[],
  filters: FilterState
): SaleTransaction[] {
  return transactions.filter((t) => {
    // Search query: match order number, product, payment method, date
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        t.orderNumber.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        t.date.includes(q);
      if (!match) return false;
    }

    // Date range filter
    if (filters.dateRange === 'aug') {
      if (!t.date.startsWith('2025-08')) return false;
    } else if (filters.dateRange === 'sep') {
      if (!t.date.startsWith('2025-09')) return false;
    } else if (filters.dateRange === 'oct') {
      if (!t.date.startsWith('2025-10')) return false;
    } else if (filters.dateRange === 'custom') {
      if (filters.customStartDate && t.date < filters.customStartDate) return false;
      if (filters.customEndDate && t.date > filters.customEndDate) return false;
    }

    // Product filter
    if (
      filters.selectedProducts.length > 0 &&
      !filters.selectedProducts.includes(t.product)
    ) {
      return false;
    }

    // Payment method filter
    if (
      filters.selectedPaymentMethods.length > 0 &&
      !filters.selectedPaymentMethods.includes(t.paymentMethod)
    ) {
      return false;
    }

    // Price range
    if (t.price < filters.minPrice || t.price > filters.maxPrice) {
      return false;
    }

    return true;
  });
}

export function computeMetricSummary(transactions: SaleTransaction[]): MetricSummary {
  if (transactions.length === 0) {
    return {
      totalRevenue: 0,
      totalUnits: 0,
      uniqueOrders: 0,
      averageOrderValue: 0,
      averageUnitPrice: 0,
      multiItemOrderCount: 0,
      multiItemOrderRate: 0,
      topProductByRevenue: { name: 'None', revenue: 0, units: 0 },
      topPaymentMethod: { method: 'Credit Card', share: 0, revenue: 0 }
    };
  }

  let totalRevenue = 0;
  const orderItemsCount = new Map<string, number>();
  const productRevenue = new Map<string, { revenue: number; units: number }>();
  const paymentRevenue = new Map<PaymentMethod, number>();

  for (const t of transactions) {
    totalRevenue += t.price;
    orderItemsCount.set(t.orderNumber, (orderItemsCount.get(t.orderNumber) || 0) + 1);

    const pData = productRevenue.get(t.product) || { revenue: 0, units: 0 };
    pData.revenue += t.price;
    pData.units += 1;
    productRevenue.set(t.product, pData);

    paymentRevenue.set(
      t.paymentMethod,
      (paymentRevenue.get(t.paymentMethod) || 0) + t.price
    );
  }

  const uniqueOrders = orderItemsCount.size;
  let multiItemOrderCount = 0;
  for (const count of orderItemsCount.values()) {
    if (count > 1) multiItemOrderCount++;
  }

  const multiItemOrderRate = uniqueOrders > 0 ? (multiItemOrderCount / uniqueOrders) * 100 : 0;
  const averageOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
  const averageUnitPrice = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  // Find top product
  let topProdName = 'None';
  let topProdRev = 0;
  let topProdUnits = 0;
  for (const [name, data] of productRevenue.entries()) {
    if (data.revenue > topProdRev) {
      topProdRev = data.revenue;
      topProdName = name;
      topProdUnits = data.units;
    }
  }

  // Find top payment method
  let topPayMethod: PaymentMethod = 'Credit Card';
  let topPayRev = 0;
  for (const [pm, rev] of paymentRevenue.entries()) {
    if (rev > topPayRev) {
      topPayRev = rev;
      topPayMethod = pm;
    }
  }
  const topPayShare = totalRevenue > 0 ? (topPayRev / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalUnits: transactions.length,
    uniqueOrders,
    averageOrderValue,
    averageUnitPrice,
    multiItemOrderCount,
    multiItemOrderRate,
    topProductByRevenue: {
      name: topProdName,
      revenue: topProdRev,
      units: topProdUnits
    },
    topPaymentMethod: {
      method: topPayMethod,
      share: topPayShare,
      revenue: topPayRev
    }
  };
}

export function computeProductStats(transactions: SaleTransaction[]): ProductStat[] {
  const map = new Map<
    string,
    { unitPrice: number; unitsSold: number; revenue: number; orderSet: Set<string> }
  >();

  let totalRev = 0;
  for (const t of transactions) {
    totalRev += t.price;
    const existing = map.get(t.product) || {
      unitPrice: t.price,
      unitsSold: 0,
      revenue: 0,
      orderSet: new Set<string>()
    };
    existing.unitsSold += 1;
    existing.revenue += t.price;
    existing.unitPrice = t.price; // consistent across this catalog
    existing.orderSet.add(t.orderNumber);
    map.set(t.product, existing);
  }

  const results: ProductStat[] = [];
  for (const [product, data] of map.entries()) {
    results.push({
      product,
      unitPrice: data.unitPrice,
      unitsSold: data.unitsSold,
      revenue: data.revenue,
      revenueShare: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0,
      orderCount: data.orderSet.size
    });
  }

  // Sort descending by revenue
  return results.sort((a, b) => b.revenue - a.revenue);
}

export function computePaymentStats(transactions: SaleTransaction[]): PaymentStat[] {
  const map = new Map<
    PaymentMethod,
    { revenue: number; units: number; orderSet: Set<string> }
  >();

  const allMethods: PaymentMethod[] = ['Credit Card', 'eWallet', 'Debit Card', 'Cash'];
  for (const m of allMethods) {
    map.set(m, { revenue: 0, units: 0, orderSet: new Set() });
  }

  let totalRev = 0;
  for (const t of transactions) {
    totalRev += t.price;
    const existing = map.get(t.paymentMethod)!;
    existing.revenue += t.price;
    existing.units += 1;
    existing.orderSet.add(t.orderNumber);
  }

  const results: PaymentStat[] = [];
  for (const [method, data] of map.entries()) {
    results.push({
      method,
      revenue: data.revenue,
      units: data.units,
      orders: data.orderSet.size,
      averageBasket: data.orderSet.size > 0 ? data.revenue / data.orderSet.size : 0,
      revenueShare: totalRev > 0 ? (data.revenue / totalRev) * 100 : 0
    });
  }

  return results.sort((a, b) => b.revenue - a.revenue);
}

export function computeDailyTimeline(transactions: SaleTransaction[]): DailyStat[] {
  const map = new Map<
    string,
    {
      revenue: number;
      units: number;
      orderSet: Set<string>;
      creditCard: number;
      eWallet: number;
      cash: number;
      debitCard: number;
    }
  >();

  for (const t of transactions) {
    if (!map.has(t.date)) {
      map.set(t.date, {
        revenue: 0,
        units: 0,
        orderSet: new Set(),
        creditCard: 0,
        eWallet: 0,
        cash: 0,
        debitCard: 0
      });
    }
    const day = map.get(t.date)!;
    day.revenue += t.price;
    day.units += 1;
    day.orderSet.add(t.orderNumber);

    if (t.paymentMethod === 'Credit Card') day.creditCard += t.price;
    else if (t.paymentMethod === 'eWallet') day.eWallet += t.price;
    else if (t.paymentMethod === 'Cash') day.cash += t.price;
    else if (t.paymentMethod === 'Debit Card') day.debitCard += t.price;
  }

  const sortedDates = Array.from(map.keys()).sort();
  return sortedDates.map((date) => {
    const d = map.get(date)!;
    return {
      date,
      revenue: d.revenue,
      units: d.units,
      orderCount: d.orderSet.size,
      creditCard: d.creditCard,
      eWallet: d.eWallet,
      cash: d.cash,
      debitCard: d.debitCard
    };
  });
}

export function computeDayOfWeekStats(transactions: SaleTransaction[]): DayOfWeekStat[] {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayBuckets: DayOfWeekStat[] = dayNames.map((dayName, dayIndex) => ({
    dayName,
    dayIndex,
    revenue: 0,
    units: 0,
    orders: 0
  }));

  const orderDays = new Map<string, Set<string>>(); // dayIndex -> set of orderNumbers
  for (let i = 0; i < 7; i++) {
    orderDays.set(String(i), new Set());
  }

  for (const t of transactions) {
    // Parse date safely YYYY-MM-DD
    const [y, m, d] = t.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayIndex = dateObj.getDay();

    dayBuckets[dayIndex].revenue += t.price;
    dayBuckets[dayIndex].units += 1;
    orderDays.get(String(dayIndex))!.add(t.orderNumber);
  }

  for (let i = 0; i < 7; i++) {
    dayBuckets[i].orders = orderDays.get(String(i))!.size;
  }

  // Rearrange starting from Monday to Sunday for business standard
  return [
    dayBuckets[1], // Mon
    dayBuckets[2], // Tue
    dayBuckets[3], // Wed
    dayBuckets[4], // Thu
    dayBuckets[5], // Fri
    dayBuckets[6], // Sat
    dayBuckets[0]  // Sun
  ];
}

export function computeBasketCooccurrence(transactions: SaleTransaction[]): BasketCooccurrence[] {
  const orderToProducts = new Map<string, string[]>();
  for (const t of transactions) {
    const list = orderToProducts.get(t.orderNumber) || [];
    list.push(t.product);
    orderToProducts.set(t.orderNumber, list);
  }

  const pairCounts = new Map<string, { productA: string; productB: string; count: number }>();

  for (const products of orderToProducts.values()) {
    if (products.length <= 1) continue;
    // unique products in this order
    const uniqueProds = Array.from(new Set(products)).sort();
    for (let i = 0; i < uniqueProds.length; i++) {
      for (let j = i + 1; j < uniqueProds.length; j++) {
        const key = `${uniqueProds[i]}|||${uniqueProds[j]}`;
        const existing = pairCounts.get(key) || {
          productA: uniqueProds[i],
          productB: uniqueProds[j],
          count: 0
        };
        existing.count += 1;
        pairCounts.set(key, existing);
      }
    }
  }

  return Array.from(pairCounts.values())
    .map((p) => ({
      productA: p.productA,
      productB: p.productB,
      cooccurrenceCount: p.count
    }))
    .sort((a, b) => b.cooccurrenceCount - a.cooccurrenceCount);
}

export function computeParetoAnalysis(productStats: ProductStat[]) {
  const totalRevenue = productStats.reduce((sum, p) => sum + p.revenue, 0);
  let runningRev = 0;

  return productStats.map((item, index) => {
    runningRev += item.revenue;
    const cumulativeShare = totalRevenue > 0 ? (runningRev / totalRevenue) * 100 : 0;
    const rankPercentile = ((index + 1) / productStats.length) * 100;

    return {
      product: item.product,
      revenue: item.revenue,
      unitsSold: item.unitsSold,
      cumulativeRevenue: runningRev,
      cumulativeShare,
      rankPercentile,
      isTop80: cumulativeShare <= 80 || (index > 0 && productStats[index - 1] && runningRev - item.revenue < totalRevenue * 0.8)
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}

export function exportTransactionsToCsv(transactions: SaleTransaction[]): string {
  const headers = ['Order Number', 'Product', 'Price', 'Date', 'Payment Method'];
  const rows = transactions.map((t) => [
    t.orderNumber,
    `"${t.product.replace(/"/g, '""')}"`,
    `$${t.price.toFixed(2)}`,
    t.date,
    t.paymentMethod
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
