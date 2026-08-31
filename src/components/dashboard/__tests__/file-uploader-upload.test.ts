import { afterEach, describe, expect, it, vi } from "vitest"

import {
  getHttpStatus,
  hasSuccessfulUpload,
  requestPresignedUpload
} from "@/components/dashboard/file-uploader-upload"
import { ImageType } from "@/lib/types/media"

const uploadInput = {
  organizationId: "org_123",
  imageType: ImageType.MENUITEM,
  objectId: "item_123",
  filename: "dish.jpg",
  contentType: "image/jpeg",
  width: 800,
  height: 600,
  bytes: 42_000
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("requestPresignedUpload", () => {
  it("sends final image metadata and returns the signed upload target", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          url: "https://uploads.example/presigned",
          method: "PUT",
          storageKey: "orgs/org_123/menu-items/item_123/image"
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" }
        }
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(requestPresignedUpload(uploadInput)).resolves.toEqual({
      url: "https://uploads.example/presigned",
      storageKey: "orgs/org_123/menu-items/item_123/image"
    })
    expect(fetchMock).toHaveBeenCalledWith("/api/file", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify(uploadInput)
    })
  })

  describe("upload completion", () => {
    it("reports success only when Uppy completed at least one file", () => {
      expect(hasSuccessfulUpload({ successful: [] })).toBe(false)
      expect(
        hasSuccessfulUpload({
          successful: [{ id: "file_123" }]
        })
      ).toBe(true)
    })

    it("reads an HTTP status from the Uppy response fallback", () => {
      expect(getHttpStatus(new Error("Upload failed"), { status: 403 })).toBe(
        403
      )
    })
  })

  it("preserves a 403 status for the Pro upgrade path", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("Pro plan required", { status: 403 }))
    )

    const request = requestPresignedUpload(uploadInput)
    await expect(request).rejects.toMatchObject({ status: 403 })
    await request.catch(error => {
      expect(getHttpStatus(error)).toBe(403)
    })
  })

  it("rejects malformed signing responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ url: "" }), { status: 200 })
        )
    )

    await expect(requestPresignedUpload(uploadInput)).rejects.toThrow(
      "Invalid upload signing response"
    )
  })
})
