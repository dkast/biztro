import html2canvas from "html2canvas"

const exportAsImage = async (
  element: HTMLElement,
  imageFilename: string
): Promise<void> => {
  const canvas = await html2canvas(element)
  const image = canvas.toDataURL("image/png", 1.0)

  downloadImage(image, imageFilename)
}

const downloadImage = (blob: string, filename: string): void => {
  const fakeLink: HTMLAnchorElement = window.document.createElement("a")

  fakeLink.className = "hidden"
  fakeLink.download = filename
  fakeLink.href = blob

  document.body.appendChild(fakeLink)
  fakeLink.click()
  document.body.removeChild(fakeLink)

  fakeLink.remove()
}

export default exportAsImage
