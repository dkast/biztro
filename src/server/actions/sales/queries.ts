"use server"

import { cacheLife, cacheTag } from "next/cache"

import { formatPriceRange, type Currency } from "@/lib/currency"
import prisma from "@/lib/prisma"
import {
  salesOrderTypeValues,
  type SalesBestSeller,
  type SalesCatalogCategory,
  type SalesCatalogData,
  type SalesCatalogProduct,
  type SalesClosingData,
  type SalesDashboardData,
  type SalesOrderType,
  type SalesRecentSale,
  type SalesRevenueByOrderType
} from "@/lib/types/sales"
import { getCacheBustedImageUrl } from "@/lib/utils"

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
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

async function getSalesTotals(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  const [totals, saleCount] = await Promise.all([
    prisma.sale.aggregate({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      },
      _sum: {
        total: true
      }
    }),
    prisma.sale.count({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      }
    })
  ])

  return {
    revenue: roundMoney(totals._sum.total ?? 0),
    orders: saleCount
  }
}

async function getBestSellers(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesBestSeller[]> {
  const rows = await prisma.saleItem.findMany({
    where: {
      sale: {
        organizationId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
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
    .slice(0, 10)
    .map(product => ({
      productName: product.productName,
      quantity: product.quantity,
      revenue: roundMoney(product.revenue)
    }))
}

async function getRecentSales(
  organizationId: string
): Promise<SalesRecentSale[]> {
  const sales = await prisma.sale.findMany({
    where: {
      organizationId
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 25,
    select: {
      id: true,
      createdAt: true,
      orderType: true,
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
    total: roundMoney(sale.total),
    items: sale.items.reduce((count, item) => count + item.quantity, 0)
  }))
}

async function getRevenueByOrderType(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesRevenueByOrderType[]> {
  const rows = await prisma.sale.groupBy({
    by: ["orderType"],
    where: {
      organizationId,
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
  organizationId: string
): Promise<SalesDashboardData> {
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!organizationId) {
    return {
      currency: "MXN",
      todayRevenue: 0,
      todayOrders: 0,
      monthRevenue: 0,
      averageTicket: 0,
      bestSellers: [],
      recentSales: []
    }
  }

  cacheTag(`sales-${organizationId}`)

  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = startOfNextDay(now)
  const monthStart = startOfMonth(now)
  const nextMonthStart = startOfNextMonth(now)

  const [currency, todayTotals, monthTotals, bestSellers, recentSales] =
    await Promise.all([
      getOrganizationCurrency(organizationId),
      getSalesTotals(organizationId, todayStart, tomorrowStart),
      getSalesTotals(organizationId, monthStart, nextMonthStart),
      getBestSellers(organizationId, monthStart, nextMonthStart),
      getRecentSales(organizationId)
    ])

  return {
    currency,
    todayRevenue: todayTotals.revenue,
    todayOrders: todayTotals.orders,
    monthRevenue: monthTotals.revenue,
    averageTicket:
      todayTotals.orders > 0
        ? roundMoney(todayTotals.revenue / todayTotals.orders)
        : 0,
    bestSellers,
    recentSales
  }
}

export async function getSalesClosingData(
  organizationId: string
): Promise<SalesClosingData> {
  "use cache: private"
  cacheLife({ stale: 30 })

  if (!organizationId) {
    return {
      currency: "MXN",
      todayRevenue: 0,
      todayOrders: 0,
      bestSellers: [],
      revenueByOrderType: []
    }
  }

  cacheTag(`sales-${organizationId}`)

  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = startOfNextDay(now)

  const [currency, todayTotals, bestSellers, revenueByOrderType] =
    await Promise.all([
      getOrganizationCurrency(organizationId),
      getSalesTotals(organizationId, todayStart, tomorrowStart),
      getBestSellers(organizationId, todayStart, tomorrowStart),
      getRevenueByOrderType(organizationId, todayStart, tomorrowStart)
    ])

  return {
    currency,
    todayRevenue: todayTotals.revenue,
    todayOrders: todayTotals.orders,
    bestSellers,
    revenueByOrderType
  }
}
