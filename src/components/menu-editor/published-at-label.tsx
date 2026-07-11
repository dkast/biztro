"use client"

export default function PublishedAtLabel({
  publishedAt
}: {
  publishedAt: number | null
}) {
  if (!publishedAt) {
    return null
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(publishedAt)
}
