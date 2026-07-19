export const MISSING_ORGANIZATION_REASON =
  "No se pudo obtener la organización actual"

export const NOT_FOUND_OR_UNAUTHORIZED_REASON = "Recurso no encontrado"

export function isSameOrganization(
  activeOrganizationId: string | null | undefined,
  targetOrganizationId: string | null | undefined
) {
  return Boolean(
    activeOrganizationId &&
    targetOrganizationId &&
    activeOrganizationId === targetOrganizationId
  )
}

export function hasCompleteTenantSelection(
  requestedIds: readonly string[],
  scopedIds: readonly string[]
) {
  if (requestedIds.length === 0) return true

  const scopedIdSet = new Set(scopedIds)
  return requestedIds.every(id => scopedIdSet.has(id))
}
