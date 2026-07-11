/**
 * Static UI label translations for the public menu.
 * Keys are English identifiers; values are translated strings per locale.
 * Spanish (es) is the default/fallback language.
 */

export type UILabelKey =
  // Info dialog (header block)
  | "information"
  | "address"
  | "available_services"
  | "delivery"
  | "free"
  | "takeout"
  | "dine_in"
  // Opening hours
  | "closed"
  | "no_schedule"
  | "open_until_singular" // "Abierto - Hasta la {time}" (1 o'clock, Spanish)
  | "open_until_plural" // "Abierto - Hasta las {time}"
  // Days of the week
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
  // Item detail dialog
  | "menu_detail"
  | "description"
  // Search / actions
  | "share"
  | "search"
  | "search_products"
  | "search_description"
  | "no_results"
  | "no_results_description"
  | "from"
  | "link_copied"
  | "link_copy_error"

type UILabels = Record<UILabelKey, string>

const labels: Record<string, UILabels> = {
  es: {
    information: "Información",
    address: "Dirección",
    available_services: "Servicios disponibles",
    delivery: "Entrega a domicilio",
    free: "Gratis",
    takeout: "Para llevar",
    dine_in: "Comer en el lugar",
    closed: "Cerrado",
    no_schedule: "Sin horario",
    open_until_singular: "Abierto - Hasta la {time}",
    open_until_plural: "Abierto - Hasta las {time}",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
    menu_detail: "Detalle del menú",
    description: "Descripción",
    share: "Compartir",
    search: "Buscar",
    search_products: "Buscar productos",
    search_description: "Busca coincidencias por nombre o descripción.",
    no_results: "Sin resultados",
    no_results_description:
      "Intenta con otro nombre o una palabra de la descripción.",
    from: "Desde",
    link_copied: "Enlace copiado",
    link_copy_error: "No se pudo copiar el enlace"
  },
  en: {
    information: "Information",
    address: "Address",
    available_services: "Available services",
    delivery: "Delivery",
    free: "Free",
    takeout: "Takeout",
    dine_in: "Dine in",
    closed: "Closed",
    no_schedule: "No schedule",
    open_until_singular: "Open - Until {time}",
    open_until_plural: "Open - Until {time}",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
    menu_detail: "Menu detail",
    description: "Description",
    share: "Share",
    search: "Search",
    search_products: "Search products",
    search_description: "Find matches by name or description.",
    no_results: "No results",
    no_results_description: "Try another name or a word from the description.",
    from: "From",
    link_copied: "Link copied",
    link_copy_error: "Could not copy link"
  },
  fr: {
    information: "Informations",
    address: "Adresse",
    available_services: "Services disponibles",
    delivery: "Livraison",
    free: "Gratuit",
    takeout: "À emporter",
    dine_in: "Sur place",
    closed: "Fermé",
    no_schedule: "Pas d'horaire",
    open_until_singular: "Ouvert - Jusqu'à {time}",
    open_until_plural: "Ouvert - Jusqu'à {time}",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    menu_detail: "Détail du menu",
    description: "Description",
    share: "Partager",
    search: "Rechercher",
    search_products: "Rechercher des produits",
    search_description: "Trouvez des correspondances par nom ou description.",
    no_results: "Aucun résultat",
    no_results_description:
      "Essayez un autre nom ou un mot de la description.",
    from: "À partir de",
    link_copied: "Lien copié",
    link_copy_error: "Impossible de copier le lien"
  },
  de: {
    information: "Informationen",
    address: "Adresse",
    available_services: "Verfügbare Services",
    delivery: "Lieferung",
    free: "Kostenlos",
    takeout: "Zum Mitnehmen",
    dine_in: "Vor Ort essen",
    closed: "Geschlossen",
    no_schedule: "Kein Zeitplan",
    open_until_singular: "Geöffnet - Bis {time}",
    open_until_plural: "Geöffnet - Bis {time}",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    sunday: "Sonntag",
    menu_detail: "Menüdetail",
    description: "Beschreibung",
    share: "Teilen",
    search: "Suchen",
    search_products: "Produkte suchen",
    search_description: "Treffer nach Name oder Beschreibung finden.",
    no_results: "Keine Ergebnisse",
    no_results_description:
      "Versuche einen anderen Namen oder ein Wort aus der Beschreibung.",
    from: "Ab",
    link_copied: "Link kopiert",
    link_copy_error: "Link konnte nicht kopiert werden"
  },
  pt: {
    information: "Informações",
    address: "Endereço",
    available_services: "Serviços disponíveis",
    delivery: "Entrega",
    free: "Grátis",
    takeout: "Para levar",
    dine_in: "Comer no local",
    closed: "Fechado",
    no_schedule: "Sem horário",
    open_until_singular: "Aberto - Até {time}",
    open_until_plural: "Aberto - Até {time}",
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo",
    menu_detail: "Detalhe do menu",
    description: "Descrição",
    share: "Compartilhar",
    search: "Buscar",
    search_products: "Buscar produtos",
    search_description: "Encontre correspondências por nome ou descrição.",
    no_results: "Sem resultados",
    no_results_description:
      "Tente outro nome ou uma palavra da descrição.",
    from: "A partir de",
    link_copied: "Link copiado",
    link_copy_error: "Não foi possível copiar o link"
  },
  it: {
    information: "Informazioni",
    address: "Indirizzo",
    available_services: "Servizi disponibili",
    delivery: "Consegna a domicilio",
    free: "Gratis",
    takeout: "Da asporto",
    dine_in: "Mangia sul posto",
    closed: "Chiuso",
    no_schedule: "Nessun orario",
    open_until_singular: "Aperto - Fino alle {time}",
    open_until_plural: "Aperto - Fino alle {time}",
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    sunday: "Domenica",
    menu_detail: "Dettaglio menu",
    description: "Descrizione",
    share: "Condividi",
    search: "Cerca",
    search_products: "Cerca prodotti",
    search_description: "Trova corrispondenze per nome o descrizione.",
    no_results: "Nessun risultato",
    no_results_description:
      "Prova un altro nome o una parola dalla descrizione.",
    from: "Da",
    link_copied: "Link copiato",
    link_copy_error: "Impossibile copiare il link"
  },
  ja: {
    information: "情報",
    address: "住所",
    available_services: "利用可能なサービス",
    delivery: "デリバリー",
    free: "無料",
    takeout: "テイクアウト",
    dine_in: "店内飲食",
    closed: "定休日",
    no_schedule: "スケジュールなし",
    open_until_singular: "営業中 - {time}まで",
    open_until_plural: "営業中 - {time}まで",
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日",
    saturday: "土曜日",
    sunday: "日曜日",
    menu_detail: "メニュー詳細",
    description: "説明",
    share: "シェア",
    search: "検索",
    search_products: "商品を検索",
    search_description: "名前または説明で一致するものを検索。",
    no_results: "結果なし",
    no_results_description: "別の名前か説明の単語で試してください。",
    from: "から",
    link_copied: "リンクをコピーしました",
    link_copy_error: "リンクをコピーできませんでした"
  },
  zh: {
    information: "信息",
    address: "地址",
    available_services: "可用服务",
    delivery: "外卖配送",
    free: "免费",
    takeout: "外带",
    dine_in: "堂食",
    closed: "休息",
    no_schedule: "无营业时间",
    open_until_singular: "营业中 - 至 {time}",
    open_until_plural: "营业中 - 至 {time}",
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
    menu_detail: "菜单详情",
    description: "描述",
    share: "分享",
    search: "搜索",
    search_products: "搜索产品",
    search_description: "按名称或描述查找匹配项。",
    no_results: "无结果",
    no_results_description: "请尝试其他名称或描述中的词语。",
    from: "起价",
    link_copied: "链接已复制",
    link_copy_error: "无法复制链接"
  }
}

/**
 * Returns a translation function for the given locale.
 * Falls back to Spanish when the key is missing or locale is null.
 */
export function getUILabels(locale: string | null) {
  const dict = (locale && labels[locale]) || labels.es!
  return function t(key: UILabelKey, vars?: Record<string, string>): string {
    let str = dict[key] ?? labels.es![key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v)
      }
    }
    return str
  }
}
