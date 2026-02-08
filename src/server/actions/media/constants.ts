/**
 * Cache tag constants for media-related queries
 */

export const CACHE_TAGS = {
  mediaAssets: (organizationId: string) => `media-assets-${organizationId}`,
  mediaCount: (organizationId: string) => `media-count-${organizationId}`,
  mediaBackgrounds: (organizationId: string) =>
    `media-backgrounds-${organizationId}`
} as const
