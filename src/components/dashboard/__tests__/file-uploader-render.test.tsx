import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { FileUploader } from "@/components/dashboard/file-uploader"
import { ImageType } from "@/lib/types/media"

const themeState = vi.hoisted(() => ({ theme: "light" }))

vi.mock("next-themes", () => ({
  useTheme: () => themeState
}))

describe.each(["light", "dark"])("FileUploader in %s mode", theme => {
  it("renders the Uppy Dashboard component", () => {
    themeState.theme = theme

    const html = renderToStaticMarkup(
      <FileUploader
        organizationId="org_123"
        imageType={ImageType.LOGO}
        objectId="logo"
        onUploadSuccess={() => undefined}
      />
    )

    expect(html).toContain("max-w-[320px]")
  })
})
