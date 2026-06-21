"use client"

import { useDeferredValue, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X
} from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { completeSale } from "@/server/actions/sales/mutations"
import { formatPrice } from "@/lib/currency"
import {
  salesOrderTypeOptions,
  type SaleCartItemInput,
  type SalesCatalogData,
  type SalesCatalogProduct,
  type SalesOrderType
} from "@/lib/types/sales"
import { cn } from "@/lib/utils"

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

type CartLine = SaleCartItemInput & {
  key: string
  productName: string
  variantName: string | null
  unitPrice: number
  lineTotal: number
  image: string | null
  currency: "MXN" | "USD"
}

export function QuickSaleScreen({ catalog }: { catalog: SalesCatalogData }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [orderType, setOrderType] = useState<SalesOrderType>("DINE_IN")
  const [cart, setCart] = useState<CartLine[]>([])
  const [selectedProduct, setSelectedProduct] =
    useState<SalesCatalogProduct | null>(null)

  const currency = cart[0]?.currency ?? catalog.products[0]?.currency ?? "MXN"

  const { execute, status, reset } = useAction(completeSale, {
    onSuccess: ({ data }) => {
      if (data?.failure?.reason) {
        toast.error(data.failure.reason)
        reset()
        return
      }

      if (data?.success) {
        toast.success(
          `Venta completada · ${formatPrice(data.success.total, currency)}`
        )
      }

      setCart([])
      setSearch("")
      setSelectedCategory("all")
      setOrderType("DINE_IN")
      setSelectedProduct(null)
      router.refresh()
      reset()
    },
    onError: () => {
      toast.error("No se pudo completar la venta")
      reset()
    }
  })

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "Todos" },
      ...catalog.categories.map(category => ({
        value: category.id,
        label: category.name
      })),
      ...(catalog.uncategorizedCount > 0
        ? [{ value: "uncategorized", label: "Sin categoría" }]
        : [])
    ],
    [catalog.categories, catalog.uncategorizedCount]
  )

  const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()

    return catalog.products.filter(product => {
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "uncategorized"
            ? product.categoryId === null
            : product.categoryId === selectedCategory

      const matchesSearch =
        query.length === 0
          ? true
          : [
              product.name,
              product.description ?? "",
              product.categoryName ?? ""
            ].some(value => value.toLowerCase().includes(query))

      return matchesCategory && matchesSearch
    })
  }, [catalog.products, deferredSearch, selectedCategory])

  const subtotal = useMemo(
    () => roundMoney(cart.reduce((sum, item) => sum + item.lineTotal, 0)),
    [cart]
  )

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  const addProduct = (product: SalesCatalogProduct, variantId?: string) => {
    const selectedVariant = variantId
      ? product.variants.find(variant => variant.id === variantId)
      : product.variants[0]

    if (!selectedVariant) {
      toast.error("Selecciona una variante")
      return
    }

    const key = `${product.id}:${selectedVariant.id}`
    const lineTotal = Number(
      (selectedVariant.price + Number.EPSILON).toFixed(2)
    )

    setCart(current => {
      const existing = current.find(item => item.key === key)
      if (existing) {
        return current.map(item =>
          item.key === key
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: Number(
                  ((item.quantity + 1) * item.unitPrice).toFixed(2)
                )
              }
            : item
        )
      }

      return [
        ...current,
        {
          key,
          menuItemId: product.id,
          variantId: selectedVariant.id,
          quantity: 1,
          productName: product.name,
          variantName: selectedVariant.name,
          unitPrice: selectedVariant.price,
          lineTotal,
          image: product.image,
          currency: product.currency
        }
      ]
    })
  }

  const handleProductSelect = (product: SalesCatalogProduct) => {
    if (product.variantCount === 0) {
      toast.error("Este producto no tiene variantes disponibles")
      return
    }

    if (product.variantCount === 1) {
      addProduct(product)
      return
    }

    setSelectedProduct(product)
  }

  const updateQuantity = (key: string, nextQuantity: number) => {
    setCart(current =>
      current
        .map(item =>
          item.key === key
            ? {
                ...item,
                quantity: nextQuantity,
                lineTotal: Number((nextQuantity * item.unitPrice).toFixed(2))
              }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    execute({
      orderType,
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    })
  }

  const clearCart = () => {
    setCart([])
    setSelectedProduct(null)
  }

  return (
    <>
      <div
        className="grid gap-6
          xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,420px)]"
      >
        <section className="min-w-0 space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative">
                  <Search
                    aria-hidden
                    className="text-muted-foreground pointer-events-none
                      absolute top-1/2 left-3 -translate-y-1/2"
                  />
                  <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Buscar producto"
                    className="h-11 pl-10 text-base"
                  />
                </div>
                <div
                  className="flex items-center justify-between gap-3
                    md:justify-end"
                >
                  <Badge variant="outline">
                    {filteredProducts.length} productos
                  </Badge>
                  <Badge variant="secondary">{cart.length} líneas</Badge>
                </div>
              </div>

              <CategoryFilter
                options={categoryOptions}
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              />
            </CardContent>
          </Card>

          <ProductGrid
            products={filteredProducts}
            onSelect={handleProductSelect}
          />
        </section>

        <aside className="h-fit xl:sticky xl:top-24">
          <Card
            className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden"
          >
            <CardHeader
              className="flex flex-row items-start justify-between gap-4 pb-4"
            >
              <div>
                <CardTitle>Venta actual</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {cart.length === 0
                    ? "Lista para empezar"
                    : `${cart.length} líneas · ${totalItems} artículos`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <Trash2 data-icon="inline-start" />
                Limpiar
              </Button>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4 pt-0">
              <OrderTypeSelector
                value={orderType}
                onValueChange={setOrderType}
              />
              <Separator />
              <SaleCart
                cart={cart}
                currency={currency}
                onDecrease={key => {
                  const line = cart.find(item => item.key === key)
                  if (!line) return
                  updateQuantity(key, line.quantity - 1)
                }}
                onIncrease={key => {
                  const line = cart.find(item => item.key === key)
                  if (!line) return
                  updateQuantity(key, line.quantity + 1)
                }}
                onRemove={key => updateQuantity(key, 0)}
              />
              <Separator />
              <SaleSummary
                subtotal={subtotal}
                total={subtotal}
                currency={currency}
                itemCount={totalItems}
              />
              <Button
                className="h-12 text-base font-semibold"
                disabled={status === "executing" || cart.length === 0}
                onClick={handleCompleteSale}
              >
                {status === "executing" ? (
                  <Loader2 data-icon="inline-start" />
                ) : (
                  <ShoppingBag data-icon="inline-start" />
                )}
                <TextMorph>
                  {status === "executing"
                    ? "Completando..."
                    : "Completar venta"}
                </TextMorph>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Sheet
        open={Boolean(selectedProduct)}
        onOpenChange={open => {
          if (!open) setSelectedProduct(null)
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[82vh] w-full max-w-2xl overflow-auto
            rounded-t-3xl border-t p-6"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl">
              {selectedProduct?.name}
            </SheetTitle>
            <SheetDescription>
              Elige una variante para agregarla a la venta
            </SheetDescription>
          </SheetHeader>

          {selectedProduct && (
            <div className="mt-6 flex flex-col gap-4">
              <div
                className="bg-muted/40 text-muted-foreground flex items-center
                  justify-between rounded-2xl p-4"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate font-medium">
                    {selectedProduct.name}
                  </p>
                  <p className="text-sm">
                    {selectedProduct.categoryName ?? "Sin categoría"}
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedProduct.variantCount} opciones
                </Badge>
              </div>

              <div className="grid gap-3">
                {selectedProduct.variants.map(variant => (
                  <Button
                    key={variant.id}
                    variant="outline"
                    className="h-auto justify-between rounded-2xl px-4 py-4
                      text-left"
                    onClick={() => {
                      addProduct(selectedProduct, variant.id)
                      setSelectedProduct(null)
                    }}
                  >
                    <span className="flex min-w-0 flex-col items-start gap-1">
                      <span className="truncate font-medium">
                        {variant.name}
                      </span>
                      {variant.description ? (
                        <span className="text-muted-foreground truncate text-sm">
                          {variant.description}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Agregar variante
                        </span>
                      )}
                    </span>
                    <span className="text-base font-semibold">
                      {formatPrice(variant.price, selectedProduct.currency)}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function CategoryFilter({
  options,
  value,
  onValueChange
}: {
  options: Array<{ value: string; label: string }>
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm font-medium">Categorías</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={next => {
          if (next) onValueChange(next)
        }}
        className="flex w-full flex-wrap justify-start gap-2"
        variant="outline"
        size="sm"
      >
        {options.map(option => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="rounded-full px-4"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

function ProductGrid({
  products,
  onSelect
}: {
  products: SalesCatalogProduct[]
  onSelect: (product: SalesCatalogProduct) => void
}) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty className="min-h-[36rem]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No hay productos</EmptyTitle>
              <EmptyDescription>
                Ajusta el filtro o la búsqueda para encontrar productos
                disponibles.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} />
      ))}
    </div>
  )
}

function ProductCard({
  product,
  onSelect
}: {
  product: SalesCatalogProduct
  onSelect: (product: SalesCatalogProduct) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={cn(
        "group bg-card overflow-hidden rounded-2xl border text-left shadow-sm",
        `transition-all hover:-translate-y-0.5 hover:shadow-md
        focus-visible:outline-none`,
        `focus-visible:ring-ring focus-visible:ring-2
        focus-visible:ring-offset-2`
      )}
    >
      <div className="bg-muted relative aspect-[4/3] overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 240px"
            className="object-cover transition-transform duration-300
              group-hover:scale-105"
          />
        ) : (
          <div
            className="from-muted via-background to-muted/40
              text-muted-foreground flex h-full w-full items-center
              justify-center bg-gradient-to-br"
          >
            <ShoppingBag className="size-7" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="shadow-sm">
            {product.priceLabel}
          </Badge>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold">{product.name}</p>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {product.description ?? product.categoryName ?? "Producto activo"}
          </p>
          {product.variantCount > 1 && (
            <Badge variant="outline" className="mt-1">
              {product.variantCount} variantes
            </Badge>
          )}
        </div>
        <div
          className="bg-primary text-primary-foreground flex size-10 shrink-0
            items-center justify-center rounded-full"
        >
          <Plus />
        </div>
      </div>
    </button>
  )
}

function OrderTypeSelector({
  value,
  onValueChange
}: {
  value: SalesOrderType
  onValueChange: (value: SalesOrderType) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Tipo de orden</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={next => {
          if (next) onValueChange(next as SalesOrderType)
        }}
        className="grid grid-cols-3 gap-2"
        variant="outline"
        size="sm"
      >
        {salesOrderTypeOptions.map(option => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="h-11 justify-center rounded-xl px-3"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

function SaleCart({
  cart,
  currency,
  onIncrease,
  onDecrease,
  onRemove
}: {
  cart: CartLine[]
  currency: "MXN" | "USD"
  onIncrease: (key: string) => void
  onDecrease: (key: string) => void
  onRemove: (key: string) => void
}) {
  if (cart.length === 0) {
    return (
      <div className="min-h-64">
        <Empty className="min-h-64 rounded-2xl border p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBag />
            </EmptyMedia>
            <EmptyTitle>Sin productos</EmptyTitle>
            <EmptyDescription>
              Toca un producto para agregarlo a la venta.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto pr-1">
      {cart.map(item => (
        <div
          key={item.key}
          className="bg-background rounded-2xl border p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{item.productName}</p>
              {item.variantName && (
                <p className="text-muted-foreground truncate text-sm">
                  {item.variantName}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                {formatPrice(item.unitPrice, currency)} c/u
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatPrice(item.lineTotal, currency)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-8 px-2 text-xs"
                onClick={() => onRemove(item.key)}
              >
                <X data-icon="inline-start" />
                Quitar
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onDecrease(item.key)}
                aria-label={`Disminuir ${item.productName}`}
              >
                <Minus data-icon="inline-start" />
              </Button>
              <div className="min-w-10 text-center text-lg font-medium">
                {item.quantity}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onIncrease(item.key)}
                aria-label={`Aumentar ${item.productName}`}
              >
                <Plus data-icon="inline-start" />
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              {formatPrice(item.lineTotal, currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function SaleSummary({
  subtotal,
  total,
  currency,
  itemCount
}: {
  subtotal: number
  total: number
  currency: "MXN" | "USD"
  itemCount: number
}) {
  return (
    <div className="bg-muted/40 rounded-2xl p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotal, currency)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Items</span>
        <span>{itemCount}</span>
      </div>
      <Separator className="my-4" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-muted-foreground text-xs">
            Sin impuestos, propinas ni descuentos
          </p>
        </div>
        <p className="text-3xl font-semibold">{formatPrice(total, currency)}</p>
      </div>
    </div>
  )
}
