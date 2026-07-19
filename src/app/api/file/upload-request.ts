import { z } from "zod/v4"

import { ImageType } from "@/lib/types/media"

export const IMAGE_UPLOAD_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp"
] as const

export const imageUploadRequestSchema = z.object({
  organizationId: z.string().optional(),
  imageType: z.enum([
    ImageType.LOGO,
    ImageType.BANNER,
    ImageType.MENUITEM,
    ImageType.MENU_BACKGROUND
  ]),
  objectId: z.string().optional(),
  contentType: z.enum(IMAGE_UPLOAD_MIME_TYPES),
  width: z.number().optional(),
  height: z.number().optional(),
  bytes: z.number().optional()
})

export function isImageUploadMimeType(
  contentType: string
): contentType is (typeof IMAGE_UPLOAD_MIME_TYPES)[number] {
  return IMAGE_UPLOAD_MIME_TYPES.some(mimeType => mimeType === contentType)
}
