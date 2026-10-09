import * as Sentry from "@sentry/nextjs"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"

import { getSalesTransactions } from "@/server/sales/transactions"
import { auth } from "@/lib/auth"
import {
  getSalesTransactionExportFilename,
  isSalesTransactionExportOverLimit,
  parseSalesTransactionsSearchParams,
  salesTransactionExportFetchLimit
} from "@/lib/sales-transactions"
import { serializeSalesTransactionsCsv } from "@/lib/sales-transactions-csv"

const responseHeaders = {
  "Cache-Control": "private, no-store"
}

export async function GET(request: NextRequest) {
  try {
    const requestHeaders = await headers()
    const session = await auth.api.getSession({ headers: requestHeaders })
    if (!session) {
      return NextResponse.json(
        { error: "Inicia sesión para exportar las transacciones." },
        { status: 401, headers: responseHeaders }
      )
    }

    const member = await auth.api.getActiveMember({ headers: requestHeaders })
    if (!member?.organizationId) {
      return NextResponse.json(
        { error: "Selecciona una organización para exportar." },
        { status: 403, headers: responseHeaders }
      )
    }

    const searchParams = request.nextUrl.searchParams
    searchParams.delete("page")
    const parsed = parseSalesTransactionsSearchParams(searchParams)
    if (!parsed.valid) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400, headers: responseHeaders }
      )
    }

    const data = await getSalesTransactions({
      organizationId: member.organizationId,
      filters: parsed.filters,
      page: 1,
      pageSize: salesTransactionExportFetchLimit
    })

    if (isSalesTransactionExportOverLimit(data.totalCount)) {
      return NextResponse.json(
        {
          error:
            "La exportación supera el límite de 10,000 transacciones. Reduce el rango de fechas o ajusta los filtros."
        },
        { status: 413, headers: responseHeaders }
      )
    }

    const csv = serializeSalesTransactionsCsv(data.transactions)

    return new Response(csv, {
      headers: {
        ...responseHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${getSalesTransactionExportFilename()}"`
      }
    })
  } catch (error) {
    unstable_rethrow(error)
    console.error("Failed to export sales transactions", error)
    Sentry.captureException(error, {
      tags: {
        section: "sales-transactions",
        operation: "export"
      }
    })

    return NextResponse.json(
      {
        error: "No se pudieron exportar las transacciones. Inténtalo de nuevo."
      },
      { status: 500, headers: responseHeaders }
    )
  }
}
