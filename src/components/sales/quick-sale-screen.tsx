"use client"

import {
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import toast from "react-hot-toast"
import { Loader2, Search, ShoppingBag, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useAction } from "next-safe-action/hooks"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { TextMorph } from "torph/react"

import { useProGuard } from "@/components/dashboard/upgrade-dialog"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput
} from "@/components/ui/number-input"
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

const productPlaceholderColors = [
  "bg-amber-500 dark:bg-amber-400 text-amber-100",
  "bg-blue-500 dark:bg-blue-400 text-blue-100",
  "bg-cyan-500 dark:bg-cyan-400 text-cyan-100",
  "bg-emerald-500 dark:bg-emerald-400 text-emerald-100",
  "bg-fuchsia-500 dark:bg-fuchsia-400 text-fuchsia-100",
  "bg-gray-500 dark:bg-gray-400 text-gray-100",
  "bg-green-500 dark:bg-green-400 text-green-100",
  "bg-indigo-500 dark:bg-indigo-400 text-indigo-100",
  "bg-lime-500 dark:bg-lime-400 text-lime-100",
  "bg-orange-500 dark:bg-orange-400 text-orange-100",
  "bg-pink-500 dark:bg-pink-400 text-pink-100",
  "bg-purple-500 dark:bg-purple-400 text-purple-100",
  "bg-red-500 dark:bg-red-400 text-red-100",
  "bg-rose-500 dark:bg-rose-400 text-rose-100",
  "bg-sky-500 dark:bg-sky-400 text-sky-100",
  "bg-teal-500 dark:bg-teal-400 text-teal-100",
  "bg-violet-500 dark:bg-violet-400 text-violet-100",
  "bg-yellow-500 dark:bg-yellow-400 text-yellow-100"
]

function getProductPlaceholderColor(name: string) {
  const hash = name.split("").reduce((accumulator, char) => {
    return accumulator + char.charCodeAt(0)
  }, 0)

  return productPlaceholderColors[hash % productPlaceholderColors.length]
}

const productAbbreviationStopWords = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "e",
  "el",
  "en",
  "la",
  "las",
  "los",
  "o",
  "u",
  "y"
])

function getProductAbbreviation(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter(word => !productAbbreviationStopWords.has(word.toLowerCase()))

  const fallbackWords = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return "?"

  if (words.length === 1) {
    return (words[0] ?? fallbackWords[0] ?? "?").slice(0, 2).toUpperCase()
  }

  return words
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase()
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

export function QuickSaleScreen({
  catalog,
  isPro
}: {
  catalog: SalesCatalogData
  isPro: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [orderType, setOrderType] = useState<SalesOrderType>("DINE_IN")
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartScrollSignal, setCartScrollSignal] = useState(0)
  const [selectedProduct, setSelectedProduct] =
    useState<SalesCatalogProduct | null>(null)

  const { guard: guardSaleCompletion, dialog: upgradeDialog } = useProGuard(
    isPro,
    {
      title: "Actualiza a Pro",
      description:
        "El registro de ventas está disponible solo en el plan Pro. Actualiza para completar ventas desde el dashboard."
    }
  )

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

  const cartProductIds = useMemo(
    () => new Set(cart.map(item => item.menuItemId)),
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

    setCartScrollSignal(signal => signal + 1)
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
          lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,420px)]"
      >
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
              <InputGroup className="h-11">
                <InputGroupInput
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar producto"
                  inputMode="search"
                  enterKeyHint="search"
                  className="h-11 text-base"
                />
                <InputGroupAddon>
                  <Search aria-hidden className="text-muted-foreground" />
                </InputGroupAddon>
              </InputGroup>
              <div
                className="flex items-center justify-between gap-3
                  md:justify-end"
              >
                <Badge variant="green">
                  {filteredProducts.length} productos
                </Badge>
                <Badge variant="blue">{cart.length} líneas</Badge>
              </div>
            </div>

            <CategoryFilter
              options={categoryOptions}
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            />
          </div>

          <ProductGrid
            products={filteredProducts}
            cartProductIds={cartProductIds}
            onSelect={handleProductSelect}
          />
        </section>

        <aside className="h-fit xl:sticky xl:top-24">
          <Card
            className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden"
          >
            <CardHeader
              className="flex flex-row items-center justify-between gap-4 pb-4"
            >
              <CardTitle className="mb-0 leading-loose">Venta actual</CardTitle>
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
                scrollToBottomSignal={cartScrollSignal}
                onQuantityChange={updateQuantity}
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
                onClick={() => guardSaleCompletion(handleCompleteSale)}
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

      {upgradeDialog}
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
            className="data-[state=on]:bg-primary
              data-[state=on]:text-primary-foreground
              dark:data-[state=on]:bg-primary/40 data-[state=on]:border-primary
              rounded-full px-4"
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
  cartProductIds,
  onSelect
}: {
  products: SalesCatalogProduct[]
  cartProductIds: Set<string>
  onSelect: (product: SalesCatalogProduct) => void
}) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Empty className="min-h-144">
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          isInCart={cartProductIds.has(product.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function ProductCard({
  product,
  isInCart,
  onSelect
}: {
  product: SalesCatalogProduct
  isInCart: boolean
  onSelect: (product: SalesCatalogProduct) => void
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(product)}
      className={cn(
        "group block w-full cursor-pointer text-left focus-visible:outline-none"
      )}
    >
      <Card
        className={cn(
          "h-full overflow-hidden text-left transition-colors",
          isInCart
            ? "inset-ring-primary/60 bg-primary/15 shadow-sm"
            : "hover:inset-ring-foreground/20 hover:bg-accent/40"
        )}
      >
        <div className="bg-muted relative aspect-3/2 overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 220px"
              className="object-cover"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                getProductPlaceholderColor(product.name)
              )}
            >
              <span className="text-lg font-semibold tracking-[0.2em]">
                {getProductAbbreviation(product.name)}
              </span>
            </div>
          )}
          {product.variantCount > 1 && (
            <div className="absolute top-2 right-2">
              <Badge
                variant="outline"
                className="bg-black/10 text-white inset-ring-white/40
                  backdrop-blur-sm text-shadow-xs"
              >
                {product.variantCount} opciones
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-1 p-2.5">
          <p className="line-clamp-2 text-sm leading-snug font-semibold">
            {product.name}
          </p>
          <p className="text-foreground text-sm font-medium tabular-nums">
            {product.priceLabel}
          </p>
        </CardContent>
      </Card>
    </motion.button>
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
    <div className="flex items-center justify-between gap-3">
      <p className="shrink-0 text-sm font-medium">Tipo de orden</p>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={next => {
          if (next) onValueChange(next as SalesOrderType)
        }}
        className="flex gap-1.5"
        variant="outline"
        size="sm"
      >
        {salesOrderTypeOptions.map(option => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="h-8 rounded-lg px-3 text-xs"
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
  scrollToBottomSignal,
  onQuantityChange
}: {
  cart: CartLine[]
  currency: "MXN" | "USD"
  scrollToBottomSignal: number
  onQuantityChange: (key: string, nextQuantity: number) => void
}) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const scrollResetTimeoutRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) return

    const scrollToBottom = () => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }

    scrollToBottom()

    if (scrollResetTimeoutRef.current !== null) {
      window.clearTimeout(scrollResetTimeoutRef.current)
    }

    scrollResetTimeoutRef.current = window.setTimeout(scrollToBottom, 220)

    return () => {
      if (scrollResetTimeoutRef.current === null) return

      window.clearTimeout(scrollResetTimeoutRef.current)
      scrollResetTimeoutRef.current = null
    }
  }, [scrollToBottomSignal])

  if (cart.length === 0) {
    return (
      <motion.div
        key="empty-cart"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          height: { duration: 0.2 },
          opacity: { duration: 0.12 }
        }}
        className="min-h-64 overflow-hidden"
      >
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
      </motion.div>
    )
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto pr-1"
    >
      <AnimatePresence initial={false}>
        {cart.map(item => (
          <motion.div
            key={item.key}
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.18 },
              opacity: { duration: 0.12 }
            }}
            className="shrink-0 overflow-hidden"
          >
            <div className="bg-background rounded-lg border p-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <p className="truncate text-sm font-medium">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p
                    className="text-muted-foreground truncate text-xs
                      leading-loose"
                  >
                    {item.variantName}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <NumberInput
                  size="md"
                  value={String(item.quantity)}
                  min={0}
                  step={1}
                  inputMode="numeric"
                  onValueChange={details => {
                    const nextQuantity = details.valueAsNumber

                    if (!Number.isFinite(nextQuantity)) return

                    onQuantityChange(item.key, nextQuantity)
                  }}
                  className="w-40 shrink-0"
                >
                  <NumberInputGroup>
                    <NumberInputDecrement
                      aria-label={`Disminuir ${item.productName}`}
                    />
                    <NumberInputInput
                      aria-label={`Cantidad de ${item.productName}`}
                    />
                    <NumberInputIncrement
                      aria-label={`Aumentar ${item.productName}`}
                    />
                  </NumberInputGroup>
                </NumberInput>
                <p className="text-sm font-semibold tabular-nums">
                  {formatPrice(item.lineTotal, currency)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
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
        <span className="text-muted-foreground">Productos</span>
        <span>{itemCount}</span>
      </div>
      <Separator className="my-4" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Total</p>
        </div>
        <p className="text-3xl font-semibold">
          <TextMorph>{formatPrice(total, currency)}</TextMorph>
        </p>
      </div>
    </div>
  )
}
