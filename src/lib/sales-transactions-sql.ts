import { Prisma } from "@/generated/prisma-client/client"

import type { SalesTransactionFilters } from "@/lib/sales-transactions"

function getPaymentStatusCondition(filters: SalesTransactionFilters) {
  const totalMinor = Prisma.sql`CAST(ROUND(cs."total" * 100) AS INTEGER)`

  switch (filters.paymentStatus) {
    case "PAID":
      return Prisma.sql`(
        ${totalMinor} = 0 OR pt.paid_minor >= ${totalMinor}
      )`
    case "PARTIAL":
      return Prisma.sql`(
        ${totalMinor} > 0 AND pt.paid_minor > 0 AND
        pt.paid_minor < ${totalMinor}
      )`
    case "PENDING":
      return Prisma.sql`(
        ${totalMinor} > 0 AND pt.paid_minor = 0
      )`
    default:
      return Prisma.sql`1 = 1`
  }
}

export function buildSalesTransactionsSql({
  organizationId,
  filters,
  page,
  pageSize
}: {
  organizationId: string
  filters: SalesTransactionFilters
  page: number
  pageSize: number
}) {
  const candidateConditions: Prisma.Sql[] = [
    Prisma.sql`s."organizationId" = ${organizationId}`
  ]

  if (filters.startDate) {
    candidateConditions.push(Prisma.sql`s."createdAt" >= ${filters.startDate}`)
  }
  if (filters.endDate) {
    candidateConditions.push(Prisma.sql`s."createdAt" < ${filters.endDate}`)
  }
  if (filters.status !== "all") {
    candidateConditions.push(Prisma.sql`s."status" = ${filters.status}`)
  }
  if (filters.orderType !== "all") {
    candidateConditions.push(Prisma.sql`s."orderType" = ${filters.orderType}`)
  }
  if (filters.q) {
    const query = filters.q.toLowerCase()
    candidateConditions.push(
      Prisma.sql`(
        instr(lower(s."id"), ${query}) > 0 OR
        instr(lower(COALESCE(c."name", '')), ${query}) > 0
      )`
    )
  }

  const filteredConditions: Prisma.Sql[] = [getPaymentStatusCondition(filters)]

  if (filters.paymentMethod !== "all") {
    filteredConditions.push(Prisma.sql`EXISTS (
      SELECT 1
      FROM "PaymentAllocation" pma
      INNER JOIN "Payment" pm
        ON pm."id" = pma."paymentId"
        AND pm."organizationId" = cs.organization_id
      WHERE pma."saleId" = cs.sale_id
        AND pm."method" = ${filters.paymentMethod}
    )`)
  }

  const offset = (page - 1) * pageSize

  return Prisma.sql`
    WITH candidate_sales AS (
      SELECT
        s."id" AS sale_id,
        s."organizationId" AS organization_id,
        s."createdAt" AS created_at,
        s."customerId" AS customer_id,
        c."name" AS customer_name,
        s."orderType" AS order_type,
        s."status" AS sale_status,
        s."total" AS total,
        s."currency" AS currency
      FROM "Sale" s
      LEFT JOIN "Customer" c
        ON c."id" = s."customerId"
        AND c."organizationId" = s."organizationId"
      WHERE ${Prisma.join(candidateConditions, " AND ")}
    ),
    payment_totals AS (
      SELECT
        cs.sale_id,
        COALESCE(
          SUM(
            CASE
              WHEN p."status" = 'ACTIVE' THEN pa."amountMinor"
              ELSE 0
            END
          ),
          0
        ) AS paid_minor
      FROM candidate_sales cs
      LEFT JOIN "PaymentAllocation" pa
        ON pa."saleId" = cs.sale_id
      LEFT JOIN "Payment" p
        ON p."id" = pa."paymentId"
        AND p."organizationId" = cs.organization_id
      GROUP BY cs.sale_id
    ),
    filtered_sales AS (
      SELECT
        cs.sale_id,
        cs.organization_id,
        cs.created_at,
        cs.customer_name,
        cs.order_type,
        cs.sale_status,
        cs.total,
        cs.currency,
        pt.paid_minor
      FROM candidate_sales cs
      INNER JOIN payment_totals pt ON pt.sale_id = cs.sale_id
      WHERE ${Prisma.join(filteredConditions, " AND ")}
    ),
    page_rows AS (
      SELECT
        fs.sale_id,
        fs.created_at,
        fs.customer_name,
        fs.order_type,
        fs.sale_status,
        fs.total,
        fs.currency,
        fs.paid_minor,
        COALESCE((
          SELECT SUM(si."quantity")
          FROM "SaleItem" si
          WHERE si."saleId" = fs.sale_id
        ), 0) AS item_count,
        COALESCE((
          SELECT GROUP_CONCAT(DISTINCT p."method")
          FROM "PaymentAllocation" pa
          INNER JOIN "Payment" p
            ON p."id" = pa."paymentId"
            AND p."organizationId" = fs.organization_id
          WHERE pa."saleId" = fs.sale_id
        ), '') AS payment_methods,
        COALESCE((
          SELECT GROUP_CONCAT(DISTINCT p."method")
          FROM "PaymentAllocation" pa
          INNER JOIN "Payment" p
            ON p."id" = pa."paymentId"
            AND p."organizationId" = fs.organization_id
          WHERE pa."saleId" = fs.sale_id
            AND p."status" = 'VOID'
        ), '') AS voided_payment_methods
      FROM filtered_sales fs
      ORDER BY fs.created_at DESC, fs.sale_id DESC
      LIMIT ${pageSize} OFFSET ${offset}
    ),
    matching_count AS (
      SELECT COUNT(*) AS total_count
      FROM filtered_sales
    )
    SELECT
      page_rows.sale_id AS id,
      page_rows.created_at AS created_at,
      page_rows.customer_name AS customer_name,
      page_rows.order_type AS order_type,
      page_rows.sale_status AS sale_status,
      page_rows.total AS total,
      page_rows.currency AS currency,
      page_rows.paid_minor AS paid_minor,
      page_rows.item_count AS item_count,
      page_rows.payment_methods AS payment_methods,
      page_rows.voided_payment_methods AS voided_payment_methods,
      matching_count.total_count AS total_count
    FROM matching_count
    LEFT JOIN page_rows ON 1 = 1
    ORDER BY page_rows.created_at DESC, page_rows.sale_id DESC
  `
}
