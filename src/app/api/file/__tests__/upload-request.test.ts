import { describe, expect, it } from "vitest"

import {
  imageUploadRequestSchema,
  isImageUploadMimeType
} from "@/app/api/file/upload-request"
import { ImageType } from "@/lib/types/media"

describe("image upload request validation", () => {
  it("accepts supported image MIME types", () => {
    expect(isImageUploadMimeType("image/png")).toBe(true)
    expect(
      imageUploadRequestSchema.safeParse({
        imageType: ImageType.LOGO,
        contentType: "image/webp"
      }).success
    ).toBe(true)
  })

  it("rejects unsupported or non-image MIME types", () => {
    expect(isImageUploadMimeType("application/pdf")).toBe(false)
    expect(
      imageUploadRequestSchema.safeParse({
        imageType: ImageType.MENUITEM,
        objectId: "item_a",
        contentType: "application/pdf"
      }).success
    ).toBe(false)
  })
})
