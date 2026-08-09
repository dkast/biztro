"use server"

import { cacheLife, cacheTag } from "next/cache"

import { formatPriceRange, type Currency } from "@/lib/currency"
import {
  calculateBalanceMinor,
  currencyToMinorUnits,
  getPaymentStatus
} from "@/lib/payments"
import prisma from "@/lib/prisma"
import {
  formatSalesClosingDateValue,
  getSalesClosingDateValue,
  parseSalesClosingDateValue
} from "@/lib/sales-closing-date"
import type { SalesDashboardPeriod } from "@/lib/sales-dashboard-period"
import {
  getCollectionBreakdown,
  getFinancialMetrics,
  minorToMoney,
  type CollectionPaymentRow,
  type FinancialSaleRow
} from "@/lib/sales-reporting"
import type {
  PaymentMethod,
  SalePaymentHistoryItem
} from "@/lib/types/payments"
import { paymentMethodValues } from "@/lib/types/payments"
import {
  salesOrderTypeValues,
  type SaleDetail,
  type SalesBestSeller,
  type SalesCatalogCategory,
  type SalesCatalogData,
  type SalesCatalogProduct,
  type SalesChartBucket,
  type SalesClosingData,
  type SalesClosingHourlyBucket,
  type SalesCollectionChartBucket,
  type SalesDashboardData,
  type SalesOrderType,
  type SalesRecentSale,
  type SalesRevenueByOrderType
} from "@/lib/types/sales"
import { getCacheBustedImageUrl } from "@/lib/utils"

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

const collectionChartMethods = [
  ...paymentMethodValues,
  "LEGACY"
] as const satisfies readonly (PaymentMethod | "LEGACY")[]

function createCollectionChartBucket(
  label: string
): SalesCollectionChartBucket {
  return {
    label,
    CASH: 0,
    CARD: 0,
    TRANSFER: 0,
    CODI: 0,
    VOUCHER: 0,
    LEGACY: 0
  }
}

function buildCollectionChartBuckets({
  payments,
  startDate,
  endDate,
  period
}: {
  payments: readonly CollectionPaymentRow[]
  startDate: Date
  endDate: Date
  period: SalesDashboardPeriod
}): SalesCollectionChartBucket[] {
  const buckets = new Map<string, SalesCollectionChartBucket>()
  const bucketType = getSalesChartBucketType(period)

  if (bucketType === "month") {
    for (
      let cursor = startOfMonth(startDate);
      cursor < endDate;
      cursor = startOfNextMonth(cursor)
    ) {
      const key = getMonthBucketKey(cursor)
      buckets.set(
        key,
        createCollectionChartBucket(
          salesChartMonthLabelFormatter.format(cursor)
        )
      )
    }

    for (const payment of payments) {
      if (payment.status === "VOID") continue

      const bucket = buckets.get(getMonthBucketKey(payment.createdAt))
      if (!bucket) continue
      bucket[payment.method] += payment.amountMinor
    }
  } else {
    for (
      let cursor = startOfDay(startDate);
      cursor < endDate;
      cursor = startOfNextDay(cursor)
    ) {
      const key = getDayBucketKey(cursor)
      buckets.set(
        key,
        createCollectionChartBucket(salesChartDayLabelFormatter.format(cursor))
      )
    }

    for (const payment of payments) {
      if (payment.status === "VOID") continue

      const bucket = buckets.get(getDayBucketKey(payment.createdAt))
      if (!bucket) continue
      bucket[payment.method] += payment.amountMinor
    }
  }

  return [...buckets.values()].map(bucket => {
    const result = { ...bucket }
    for (const method of collectionChartMethods) {
      result[method] = minorToMoney(bucket[method])
    }
    return result
  })
}

function startOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfNextDay(date = new Date()) {
  const next = startOfDay(date)
  next.setDate(next.getDate() + 1)
  return next
}

function startOfMonth(date = new Date()) {
  const next = new Date(date)
  next.setDate(1)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfNextMonth(date = new Date()) {
  const next = startOfMonth(date)
  next.setMonth(next.getMonth() + 1)
  return next
}

function completedSalesWhere(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency
) {
  return {
    organizationId,
    status: "COMPLETED" as const,
    currency,
    createdAt: {
      gte: startDate,
      lt: endDate
    }
  }
}

async function getReceivablesDashboardSummary(organizationId: string) {
  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
      status: "COMPLETED",
      customerId: { not: null }
    },
    select: {
      customerId: true,
      currency: true,
      total: true,
      paymentAllocations: {
        select: {
          amountMinor: true,
          payment: { select: { status: true, origin: true } }
        }
      }
    }
  })

  let hasCreditHistory = false
  const byCurrency = new Map<
    Currency,
    { balanceMinor: number; openSales: number; customerIds: Set<string> }
  >()

  for (const sale of sales) {
    const salePaidMinor = sale.paymentAllocations.reduce(
      (total, allocation) =>
        allocation.payment.status === "ACTIVE" &&
        allocation.payment.origin === "SALE"
          ? total + allocation.amountMinor
          : total,
      0
    )
    if (currencyToMinorUnits(sale.total) > salePaidMinor) {
      hasCreditHistory = true
    }

    const paidMinor = sale.paymentAllocations.reduce(
      (total, allocation) =>
        allocation.payment.status === "ACTIVE"
          ? total + allocation.amountMinor
          : total,
      0
    )
    const balanceMinor = calculateBalanceMinor(
      currencyToMinorUnits(sale.total),
      paidMinor
    )
    if (balanceMinor === 0 || !sale.customerId) continue

    const summary = byCurrency.get(sale.currency) ?? {
      balanceMinor: 0,
      openSales: 0,
      customerIds: new Set<string>()
    }
    summary.balanceMinor += balanceMinor
    summary.openSales += 1
    summary.customerIds.add(sale.customerId)
    byCurrency.set(sale.currency, summary)
  }

  return {
    receivables: [...byCurrency.entries()]
      .map(([currency, summary]) => ({
        currency,
        balanceMinor: summary.balanceMinor,
        openSales: summary.openSales,
        customers: summary.customerIds.size
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency)),
    hasCreditHistory
  }
}

function startOfRollingPeriod(
  period: SalesDashboardPeriod,
  date = new Date()
): Date {
  const next = startOfDay(date)

  switch (period) {
    case "7d":
      next.setDate(next.getDate() - 6)
      return next
    case "1m":
      next.setMonth(next.getMonth() - 1)
      return next
    case "3m":
      next.setMonth(next.getMonth() - 3)
      return next
    case "1y":
      next.setFullYear(next.getFullYear() - 1)
      return next
  }
}

function getSalesChartBucketType(period: SalesDashboardPeriod) {
  return period === "1y" ? "month" : "day"
}

const salesChartDayLabelFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short"
})

const salesChartMonthLabelFormatter = new Intl.DateTimeFormat("es-MX", {
  month: "short",
  year: "2-digit"
})

function getDayBucketKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-")
}

function getMonthBucketKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function buildSalesChartBuckets({
  sales,
  payments,
  startDate,
  endDate,
  period
}: {
  sales: readonly FinancialSaleRow[]
  payments: readonly CollectionPaymentRow[]
  startDate: Date
  endDate: Date
  period: SalesDashboardPeriod
}) {
  const bucketType = getSalesChartBucketType(period)
  const buckets = new Map<string, SalesChartBucket>()

  if (bucketType === "month") {
    for (
      let cursor = startOfMonth(startDate);
      cursor < endDate;
      cursor = startOfNextMonth(cursor)
    ) {
      const key = getMonthBucketKey(cursor)
      buckets.set(key, {
        label: salesChartMonthLabelFormatter.format(cursor),
        revenue: 0,
        orders: 0,
        sales: 0,
        collected: 0,
        paidAtSale: 0,
        creditGenerated: 0,
        receivableCollection: 0
      })
    }

    for (const sale of sales) {
      const key = getMonthBucketKey(sale.createdAt)
      const bucket = buckets.get(key)

      if (!bucket) continue

      const totalMinor = currencyToMinorUnits(sale.total)
      const salePaidMinor = sale.paymentAllocations.reduce(
        (total, allocation) =>
          allocation.payment.status === "ACTIVE" &&
          allocation.payment.origin === "SALE"
            ? total + allocation.amountMinor
            : total,
        0
      )

      bucket.sales += totalMinor
      bucket.revenue += totalMinor
      bucket.orders += 1
      bucket.paidAtSale += Math.min(totalMinor, salePaidMinor)
      bucket.creditGenerated += Math.max(0, totalMinor - salePaidMinor)
    }

    for (const payment of payments) {
      const bucket = buckets.get(getMonthBucketKey(payment.createdAt))
      if (!bucket) continue

      bucket.collected += payment.amountMinor
      if (payment.origin === "RECEIVABLE") {
        bucket.receivableCollection += payment.amountMinor
      }
    }
  } else {
    for (
      let cursor = startOfDay(startDate);
      cursor < endDate;
      cursor = startOfNextDay(cursor)
    ) {
      const key = getDayBucketKey(cursor)
      buckets.set(key, {
        label: salesChartDayLabelFormatter.format(cursor),
        revenue: 0,
        orders: 0,
        sales: 0,
        collected: 0,
        paidAtSale: 0,
        creditGenerated: 0,
        receivableCollection: 0
      })
    }

    for (const sale of sales) {
      const key = getDayBucketKey(sale.createdAt)
      const bucket = buckets.get(key)

      if (!bucket) continue

      const totalMinor = currencyToMinorUnits(sale.total)
      const salePaidMinor = sale.paymentAllocations.reduce(
        (total, allocation) =>
          allocation.payment.status === "ACTIVE" &&
          allocation.payment.origin === "SALE"
            ? total + allocation.amountMinor
            : total,
        0
      )

      bucket.sales += totalMinor
      bucket.revenue += totalMinor
      bucket.orders += 1
      bucket.paidAtSale += Math.min(totalMinor, salePaidMinor)
      bucket.creditGenerated += Math.max(0, totalMinor - salePaidMinor)
    }

    for (const payment of payments) {
      const bucket = buckets.get(getDayBucketKey(payment.createdAt))
      if (!bucket) continue

      bucket.collected += payment.amountMinor
      if (payment.origin === "RECEIVABLE") {
        bucket.receivableCollection += payment.amountMinor
      }
    }
  }

  return [...buckets.values()].map(bucket => ({
    ...bucket,
    revenue: minorToMoney(bucket.revenue),
    sales: minorToMoney(bucket.sales),
    collected: minorToMoney(bucket.collected),
    paidAtSale: minorToMoney(bucket.paidAtSale),
    creditGenerated: minorToMoney(bucket.creditGenerated),
    receivableCollection: minorToMoney(bucket.receivableCollection)
  }))
}

function mapCatalogProduct({
  item,
  categoryName
}: {
  item: {
    id: string
    name: string
    description: string | null
    image: string | null
    currency: Currency
    categoryId: string | null
    updatedAt: Date
    variants: Array<{
      id: string
      name: string
      description: string | null
      price: number
    }>
  }
  categoryName: string | null
}): SalesCatalogProduct {
  const variants = [...item.variants].sort((a, b) => a.price - b.price)
  const minPrice = variants[0]?.price ?? 0
  const maxPrice = variants[variants.length - 1]?.price ?? minPrice

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.image
      ? getCacheBustedImageUrl(item.image, item.updatedAt)
      : null,
    categoryId: item.categoryId,
    categoryName,
    currency: item.currency,
    price: minPrice,
    priceLabel:
      variants.length > 0
        ? formatPriceRange(minPrice, maxPrice, item.currency)
        : "Sin precio",
    variantCount: variants.length,
    variants: variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      description: variant.description,
      price: variant.price
    }))
  }
}

async function getOrganizationCurrency(
  organizationId: string
): Promise<Currency> {
  const latestSale = await prisma.sale.findFirst({
    where: {
      organizationId
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      currency: true
    }
  })

  if (latestSale?.currency) {
    return latestSale.currency
  }

  const defaultLocation = await prisma.location.findFirst({
    where: {
      organizationId
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      currency: true
    }
  })

  return defaultLocation?.currency ?? "MXN"
}

async function getVoidedSalesTotals(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency
) {
  const totals = await prisma.sale.aggregate({
    where: {
      organizationId,
      status: "VOID",
      currency,
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  })

  return {
    amount: roundMoney(totals._sum.total ?? 0),
    sales: totals._count.id
  }
}

async function getBestSellers(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency,
  limit = 10
): Promise<SalesBestSeller[]> {
  const rows = await prisma.saleItem.findMany({
    where: {
      sale: {
        ...completedSalesWhere(organizationId, startDate, endDate, currency)
      }
    },
    select: {
      productName: true,
      quantity: true,
      lineTotal: true
    }
  })

  const products = new Map<
    string,
    {
      productName: string
      quantity: number
      revenue: number
    }
  >()

  for (const row of rows) {
    const current = products.get(row.productName) ?? {
      productName: row.productName,
      quantity: 0,
      revenue: 0
    }

    current.quantity += row.quantity
    current.revenue += row.lineTotal
    products.set(row.productName, current)
  }

  return [...products.values()]
    .sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity
      if (b.revenue !== a.revenue) return b.revenue - a.revenue
      return a.productName.localeCompare(b.productName)
    })
    .slice(0, limit)
    .map(product => ({
      productName: product.productName,
      quantity: product.quantity,
      revenue: roundMoney(product.revenue)
    }))
}

async function getRecentSales(
  organizationId: string,
  currency: Currency,
  range?: { startDate: Date; endDate: Date },
  limit = 25
): Promise<SalesRecentSale[]> {
  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
      currency,
      ...(range
        ? { createdAt: { gte: range.startDate, lt: range.endDate } }
        : {})
    },
    orderBy: {
      createdAt: "desc"
    },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      orderType: true,
      status: true,
      total: true,
      items: {
        select: {
          quantity: true
        }
      }
    }
  })

  return sales.map(sale => ({
    id: sale.id,
    createdAt: sale.createdAt.toISOString(),
    orderType: sale.orderType as SalesOrderType,
    status: sale.status,
    total: roundMoney(sale.total),
    items: sale.items.reduce((count, item) => count + item.quantity, 0)
  }))
}

const salesClosingHourLabelFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  hour12: true
})

function getHourLabel(hour: number) {
  return salesClosingHourLabelFormatter.format(new Date(2000, 0, 1, hour))
}

function getHourlySalesBuckets(
  sales: readonly FinancialSaleRow[],
  payments: readonly CollectionPaymentRow[],
  selectedDayStart: Date
): SalesClosingHourlyBucket[] {
  const buckets = new Map<number, SalesClosingHourlyBucket>()

  for (let hour = 0; hour < 24; hour++) {
    buckets.set(hour, {
      hour,
      label: getHourLabel(hour),
      todayOrders: 0,
      todayRevenue: 0,
      todaySales: 0,
      todayCollected: 0,
      todayPaidAtSale: 0,
      todayCreditGenerated: 0,
      todayReceivableCollection: 0,
      previousOrders: 0,
      previousRevenue: 0,
      previousSales: 0,
      previousCollected: 0,
      previousPaidAtSale: 0,
      previousCreditGenerated: 0,
      previousReceivableCollection: 0
    })
  }

  for (const sale of sales) {
    const bucket = buckets.get(sale.createdAt.getHours())

    if (!bucket) continue

    const totalMinor = currencyToMinorUnits(sale.total)
    const salePaidMinor = sale.paymentAllocations.reduce(
      (total, allocation) =>
        allocation.payment.status === "ACTIVE" &&
        allocation.payment.origin === "SALE"
          ? total + allocation.amountMinor
          : total,
      0
    )
    const creditGeneratedMinor = Math.max(0, totalMinor - salePaidMinor)

    if (sale.createdAt >= selectedDayStart) {
      bucket.todayOrders += 1
      bucket.todayRevenue += totalMinor
      bucket.todaySales += totalMinor
      bucket.todayPaidAtSale += Math.min(totalMinor, salePaidMinor)
      bucket.todayCreditGenerated += creditGeneratedMinor
    } else {
      bucket.previousOrders += 1
      bucket.previousRevenue += totalMinor
      bucket.previousSales += totalMinor
      bucket.previousPaidAtSale += Math.min(totalMinor, salePaidMinor)
      bucket.previousCreditGenerated += creditGeneratedMinor
    }
  }

  for (const payment of payments) {
    if (payment.status === "VOID") continue

    const bucket = buckets.get(payment.createdAt.getHours())

    if (!bucket) continue

    if (payment.createdAt >= selectedDayStart) {
      bucket.todayCollected += payment.amountMinor
      if (payment.origin === "RECEIVABLE") {
        bucket.todayReceivableCollection += payment.amountMinor
      }
    } else {
      bucket.previousCollected += payment.amountMinor
      if (payment.origin === "RECEIVABLE") {
        bucket.previousReceivableCollection += payment.amountMinor
      }
    }
  }

  const allBuckets = [...buckets.values()]
  const activeHours = allBuckets
    .filter(
      bucket =>
        bucket.todayOrders > 0 ||
        bucket.previousOrders > 0 ||
        bucket.todayRevenue > 0 ||
        bucket.previousRevenue > 0 ||
        bucket.todayCollected > 0 ||
        bucket.previousCollected > 0
    )
    .map(bucket => bucket.hour)

  if (activeHours.length === 0) {
    return []
  }

  const minHour = Math.min(...activeHours)
  const maxHour = Math.max(...activeHours)

  return allBuckets
    .filter(bucket => bucket.hour >= minHour && bucket.hour <= maxHour)
    .map(bucket => ({
      ...bucket,
      todayRevenue: minorToMoney(bucket.todayRevenue),
      todaySales: minorToMoney(bucket.todaySales),
      todayCollected: minorToMoney(bucket.todayCollected),
      todayPaidAtSale: minorToMoney(bucket.todayPaidAtSale),
      todayCreditGenerated: minorToMoney(bucket.todayCreditGenerated),
      todayReceivableCollection: minorToMoney(bucket.todayReceivableCollection),
      previousRevenue: minorToMoney(bucket.previousRevenue),
      previousSales: minorToMoney(bucket.previousSales),
      previousCollected: minorToMoney(bucket.previousCollected),
      previousPaidAtSale: minorToMoney(bucket.previousPaidAtSale),
      previousCreditGenerated: minorToMoney(bucket.previousCreditGenerated),
      previousReceivableCollection: minorToMoney(
        bucket.previousReceivableCollection
      )
    }))
}

function getSalesChartRows(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency
): Promise<FinancialSaleRow[]> {
  return prisma.sale.findMany({
    where: {
      ...completedSalesWhere(organizationId, startDate, endDate, currency)
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      createdAt: true,
      total: true,
      paymentAllocations: {
        select: {
          amountMinor: true,
          payment: {
            select: {
              status: true,
              origin: true
            }
          }
        }
      }
    }
  })
}

function getCollectionPaymentRows(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency
): Promise<CollectionPaymentRow[]> {
  return prisma.payment.findMany({
    where: {
      organizationId,
      currency,
      status: "ACTIVE",
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      createdAt: true,
      amountMinor: true,
      method: true,
      origin: true,
      status: true
    }
  })
}

async function getRevenueByOrderType(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  currency: Currency
): Promise<SalesRevenueByOrderType[]> {
  const rows = await prisma.sale.groupBy({
    by: ["orderType"],
    where: {
      ...completedSalesWhere(organizationId, startDate, endDate, currency)
    },
    _sum: {
      total: true
    },
    _count: {
      id: true
    }
  })

  return salesOrderTypeValues.map(orderType => {
    const row = rows.find(entry => entry.orderType === orderType)

    return {
      orderType,
      revenue: roundMoney(row?._sum.total ?? 0),
      orders: row?._count.id ?? 0
    }
  })
}

export async function getSalesCatalog(
  organizationId: string
): Promise<SalesCatalogData> {
  "use cache: private"
  cacheLife({ stale: 60 })

  if (!organizationId) {
    return {
      categories: [],
      products: [],
      uncategorizedCount: 0
    }
  }

  cacheTag(`menu-items-${organizationId}`)
  cacheTag(`categories-${organizationId}`)

  const [categories, uncategorized] = await Promise.all([
    prisma.category.findMany({
      where: {
        organizationId,
        menuItems: {
          some: {
            status: "ACTIVE"
          }
        }
      },
      orderBy: {
        name: "asc"
      },
      include: {
        menuItems: {
          where: {
            status: "ACTIVE"
          },
          orderBy: {
            name: "asc"
          },
          include: {
            variants: {
              orderBy: {
                price: "asc"
              }
            }
          }
        }
      }
    }),
    prisma.menuItem.findMany({
      where: {
        organizationId,
        categoryId: null,
        status: "ACTIVE"
      },
      orderBy: {
        name: "asc"
      },
      include: {
        variants: {
          orderBy: {
            price: "asc"
          }
        }
      }
    })
  ])

  const catalogCategories: SalesCatalogCategory[] = categories.map(
    category => ({
      id: category.id,
      name: category.name,
      itemCount: category.menuItems.length
    })
  )

  const products = [
    ...categories.flatMap(category =>
      category.menuItems.map(item =>
        mapCatalogProduct({
          item: {
            id: item.id,
            name: item.name,
            description: item.description ?? null,
            image: item.image ?? null,
            currency: item.currency,
            categoryId: item.categoryId ?? null,
            updatedAt: item.updatedAt,
            variants: item.variants.map(variant => ({
              id: variant.id,
              name: variant.name,
              description: variant.description ?? null,
              price: variant.price
            }))
          },
          categoryName: category.name
        })
      )
    ),
    ...uncategorized.map(item =>
      mapCatalogProduct({
        item: {
          id: item.id,
          name: item.name,
          description: item.description ?? null,
          image: item.image ?? null,
          currency: item.currency,
          categoryId: item.categoryId ?? null,
          updatedAt: item.updatedAt,
          variants: item.variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            description: variant.description ?? null,
            price: variant.price
          }))
        },
        categoryName: null
      })
    )
  ]

  return {
    categories: catalogCategories,
    products,
    uncategorizedCount: uncategorized.length
  }
}

export async function getSalesDashboardData(
  organizationId: string,
  period: SalesDashboardPeriod
): Promise<SalesDashboardData> {
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!organizationId) {
    return {
      currency: "MXN",
      period,
      todayRevenue: 0,
      todayOrders: 0,
      periodRevenue: 0,
      periodOrders: 0,
      periodAverageTicket: 0,
      todaySales: 0,
      todayCollected: 0,
      todayPaidAtSale: 0,
      todayCreditGenerated: 0,
      todayReceivableCollection: 0,
      periodSales: 0,
      periodCollected: 0,
      periodPaidAtSale: 0,
      periodCreditGenerated: 0,
      periodReceivableCollection: 0,
      collectionBreakdown: [],
      collectionChart: [],
      hasCreditHistory: false,
      chart: [],
      bestSellers: [],
      recentSales: [],
      receivables: []
    }
  }

  cacheTag(`sales-${organizationId}`)
  cacheTag(`receivables-${organizationId}`)

  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = startOfNextDay(now)
  const periodStart = startOfRollingPeriod(period, now)

  const currency = await getOrganizationCurrency(organizationId)
  const [
    periodSales,
    todayPayments,
    periodPayments,
    bestSellers,
    recentSales,
    receivablesSummary
  ] = await Promise.all([
    getSalesChartRows(organizationId, periodStart, tomorrowStart, currency),
    getCollectionPaymentRows(
      organizationId,
      todayStart,
      tomorrowStart,
      currency
    ),
    getCollectionPaymentRows(
      organizationId,
      periodStart,
      tomorrowStart,
      currency
    ),
    getBestSellers(organizationId, periodStart, tomorrowStart, currency, 5),
    getRecentSales(organizationId, currency, undefined, 5),
    getReceivablesDashboardSummary(organizationId)
  ])

  const todaySalesRows = periodSales.filter(
    sale => sale.createdAt >= todayStart && sale.createdAt < tomorrowStart
  )
  const todayMetrics = getFinancialMetrics({
    sales: todaySalesRows,
    payments: todayPayments
  })
  const periodMetrics = getFinancialMetrics({
    sales: periodSales,
    payments: periodPayments
  })
  const periodRevenue = periodMetrics.sales
  const periodOrders = periodSales.length

  return {
    currency,
    period,
    todayRevenue: todayMetrics.sales,
    todayOrders: todaySalesRows.length,
    periodRevenue,
    periodOrders,
    periodAverageTicket:
      periodOrders > 0 ? roundMoney(periodRevenue / periodOrders) : 0,
    todaySales: todayMetrics.sales,
    todayCollected: todayMetrics.collected,
    todayPaidAtSale: todayMetrics.paidAtSale,
    todayCreditGenerated: todayMetrics.creditGenerated,
    todayReceivableCollection: todayMetrics.receivableCollection,
    periodSales: periodMetrics.sales,
    periodCollected: periodMetrics.collected,
    periodPaidAtSale: periodMetrics.paidAtSale,
    periodCreditGenerated: periodMetrics.creditGenerated,
    periodReceivableCollection: periodMetrics.receivableCollection,
    collectionBreakdown: getCollectionBreakdown(periodPayments),
    collectionChart: buildCollectionChartBuckets({
      payments: periodPayments,
      startDate: periodStart,
      endDate: tomorrowStart,
      period
    }),
    hasCreditHistory: receivablesSummary.hasCreditHistory,
    chart: buildSalesChartBuckets({
      sales: periodSales,
      payments: periodPayments,
      startDate: periodStart,
      endDate: tomorrowStart,
      period
    }),
    bestSellers,
    recentSales,
    receivables: receivablesSummary.receivables
  }
}

export async function getSalesClosingData(
  organizationId: string,
  selectedDateValue = getSalesClosingDateValue()
): Promise<SalesClosingData> {
  "use cache: private"
  cacheLife({ stale: 30 })

  const selectedDate =
    parseSalesClosingDateValue(selectedDateValue) ?? new Date()
  const normalizedSelectedDateValue = formatSalesClosingDateValue(selectedDate)
  const previousDate = new Date(selectedDate)
  previousDate.setDate(previousDate.getDate() - 1)
  const normalizedPreviousDateValue = formatSalesClosingDateValue(previousDate)

  if (!organizationId) {
    return {
      selectedDateValue: normalizedSelectedDateValue,
      previousDateValue: normalizedPreviousDateValue,
      currency: "MXN",
      todayRevenue: 0,
      todayOrders: 0,
      todayAverageTicket: 0,
      todaySales: 0,
      todayCollected: 0,
      todayPaidAtSale: 0,
      todayCreditGenerated: 0,
      todayReceivableCollection: 0,
      collectionBreakdown: [],
      collectionChart: [],
      hasCreditHistory: false,
      voidedSales: 0,
      voidedAmount: 0,
      topProduct: null,
      previous: {
        revenue: 0,
        orders: 0,
        averageTicket: 0,
        sales: 0,
        collected: 0,
        paidAtSale: 0,
        creditGenerated: 0,
        receivableCollection: 0
      },
      bestSellers: [],
      revenueByOrderType: [],
      hourly: [],
      recentSales: []
    }
  }

  cacheTag(`sales-${organizationId}`)

  const selectedDayStart = startOfDay(selectedDate)
  const tomorrowStart = startOfNextDay(selectedDate)
  const previousDayStart = startOfDay(previousDate)

  const currency = await getOrganizationCurrency(organizationId)
  const [
    voidedTotals,
    todaySalesRows,
    previousSalesRows,
    todayPayments,
    previousPayments,
    bestSellers,
    revenueByOrderType,
    recentSales,
    receivablesSummary
  ] = await Promise.all([
    getVoidedSalesTotals(
      organizationId,
      selectedDayStart,
      tomorrowStart,
      currency
    ),
    getSalesChartRows(
      organizationId,
      selectedDayStart,
      tomorrowStart,
      currency
    ),
    getSalesChartRows(
      organizationId,
      previousDayStart,
      selectedDayStart,
      currency
    ),
    getCollectionPaymentRows(
      organizationId,
      selectedDayStart,
      tomorrowStart,
      currency
    ),
    getCollectionPaymentRows(
      organizationId,
      previousDayStart,
      selectedDayStart,
      currency
    ),
    getBestSellers(organizationId, selectedDayStart, tomorrowStart, currency),
    getRevenueByOrderType(
      organizationId,
      selectedDayStart,
      tomorrowStart,
      currency
    ),
    getRecentSales(organizationId, currency, {
      startDate: selectedDayStart,
      endDate: tomorrowStart
    }),
    getReceivablesDashboardSummary(organizationId)
  ])

  const todayMetrics = getFinancialMetrics({
    sales: todaySalesRows,
    payments: todayPayments
  })
  const previousMetrics = getFinancialMetrics({
    sales: previousSalesRows,
    payments: previousPayments
  })
  const hourly = getHourlySalesBuckets(
    [...todaySalesRows, ...previousSalesRows],
    [...todayPayments, ...previousPayments],
    selectedDayStart
  )
  const todayAverageTicket =
    todaySalesRows.length > 0
      ? roundMoney(todayMetrics.sales / todaySalesRows.length)
      : 0
  const previousAverageTicket =
    previousSalesRows.length > 0
      ? roundMoney(previousMetrics.sales / previousSalesRows.length)
      : 0

  return {
    selectedDateValue: normalizedSelectedDateValue,
    previousDateValue: normalizedPreviousDateValue,
    currency,
    todayRevenue: todayMetrics.sales,
    todayOrders: todaySalesRows.length,
    todayAverageTicket,
    todaySales: todayMetrics.sales,
    todayCollected: todayMetrics.collected,
    todayPaidAtSale: todayMetrics.paidAtSale,
    todayCreditGenerated: todayMetrics.creditGenerated,
    todayReceivableCollection: todayMetrics.receivableCollection,
    collectionBreakdown: getCollectionBreakdown(todayPayments),
    collectionChart: buildCollectionChartBuckets({
      payments: todayPayments,
      startDate: selectedDayStart,
      endDate: tomorrowStart,
      period: "7d"
    }),
    hasCreditHistory: receivablesSummary.hasCreditHistory,
    voidedSales: voidedTotals.sales,
    voidedAmount: voidedTotals.amount,
    topProduct: bestSellers[0] ?? null,
    previous: {
      revenue: previousMetrics.sales,
      orders: previousSalesRows.length,
      averageTicket: previousAverageTicket,
      sales: previousMetrics.sales,
      collected: previousMetrics.collected,
      paidAtSale: previousMetrics.paidAtSale,
      creditGenerated: previousMetrics.creditGenerated,
      receivableCollection: previousMetrics.receivableCollection
    },
    bestSellers,
    revenueByOrderType,
    hourly,
    recentSales
  }
}

export async function getSaleDetail(
  organizationId: string,
  saleId: string
): Promise<SaleDetail | null> {
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!organizationId || !saleId) return null

  cacheTag(`sales-${organizationId}`)
  cacheTag(`sale-${saleId}`)

  const sale = await prisma.sale.findFirst({
    where: {
      id: saleId,
      organizationId
    },
    select: {
      id: true,
      status: true,
      orderType: true,
      currency: true,
      total: true,
      customer: {
        select: {
          id: true,
          name: true
        }
      },
      createdAt: true,
      completedAt: true,
      completedByUserId: true,
      voidedAt: true,
      voidedByUserId: true,
      voidReason: true,
      items: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          productName: true,
          variantName: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true
        }
      },
      paymentAllocations: {
        orderBy: { createdAt: "asc" },
        select: {
          amountMinor: true,
          payment: {
            select: {
              id: true,
              createdAt: true,
              createdByUserId: true,
              currency: true,
              amountMinor: true,
              method: true,
              origin: true,
              status: true,
              reference: true,
              notes: true,
              voidedAt: true,
              voidedByUserId: true,
              voidReason: true,
              allocations: { select: { id: true } }
            }
          }
        }
      }
    }
  })

  if (!sale) return null

  const actorIds = [
    sale.completedByUserId,
    sale.voidedByUserId,
    ...sale.paymentAllocations.flatMap(allocation => [
      allocation.payment.createdByUserId,
      allocation.payment.voidedByUserId
    ])
  ].filter((id): id is string => Boolean(id))
  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: {
          id: {
            in: actorIds
          }
        },
        select: {
          id: true,
          name: true
        }
      })
    : []
  const actorsById = new Map(actors.map(actor => [actor.id, actor]))
  const totalMinor = currencyToMinorUnits(sale.total)
  const paidMinor = sale.paymentAllocations.reduce(
    (total, allocation) =>
      allocation.payment.status === "ACTIVE"
        ? total + allocation.amountMinor
        : total,
    0
  )
  const balanceMinor = calculateBalanceMinor(totalMinor, paidMinor)
  const payments: SalePaymentHistoryItem[] = sale.paymentAllocations.map(
    allocation => ({
      id: allocation.payment.id,
      createdAt: allocation.payment.createdAt.toISOString(),
      method: allocation.payment.method,
      origin: allocation.payment.origin,
      amountMinor: allocation.payment.amountMinor,
      allocatedMinor: allocation.amountMinor,
      reference: allocation.payment.reference,
      notes: allocation.payment.notes,
      status: allocation.payment.status,
      createdBy: allocation.payment.createdByUserId
        ? (actorsById.get(allocation.payment.createdByUserId) ?? {
            id: allocation.payment.createdByUserId,
            name: "Actor no registrado"
          })
        : null,
      voidedAt: allocation.payment.voidedAt?.toISOString() ?? null,
      voidReason: allocation.payment.voidReason,
      allocationCount: allocation.payment.allocations.length
    })
  )

  return {
    id: sale.id,
    status: sale.status,
    orderType: sale.orderType as SalesOrderType,
    currency: sale.currency,
    total: roundMoney(sale.total),
    paidMinor,
    balanceMinor,
    paymentStatus: getPaymentStatus(totalMinor, paidMinor),
    customer: sale.customer,
    createdAt: sale.createdAt.toISOString(),
    completedAt: sale.completedAt?.toISOString() ?? null,
    completedBy: sale.completedByUserId
      ? (actorsById.get(sale.completedByUserId) ?? {
          id: sale.completedByUserId,
          name: "Actor no registrado"
        })
      : null,
    voidedAt: sale.voidedAt?.toISOString() ?? null,
    voidedBy: sale.voidedByUserId
      ? (actorsById.get(sale.voidedByUserId) ?? {
          id: sale.voidedByUserId,
          name: "Actor no registrado"
        })
      : null,
    voidReason: sale.voidReason,
    items: sale.items.map(item => ({
      ...item,
      unitPrice: roundMoney(item.unitPrice),
      lineTotal: roundMoney(item.lineTotal)
    })),
    payments
  }
}
