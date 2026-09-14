import { type ImageType } from "@/lib/types/media"

export interface PresignedUploadInput {
  organizationId: string
  imageType: ImageType
  objectId: string
  filename: string
  contentType: string
  width?: number
  height?: number
  bytes?: number
}

export interface PresignedUpload {
  url: string
  storageKey: string
}

export interface HttpError extends Error {
  status: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export async function requestPresignedUpload(
  input: PresignedUploadInput
): Promise<PresignedUpload> {
  const response = await fetch("/api/file", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    throw Object.assign(new Error("Unsuccessful upload signing request"), {
      status: response.status
    } satisfies Pick<HttpError, "status">)
  }

  const raw: unknown = await response.json()
  if (
    !isRecord(raw) ||
    typeof raw.url !== "string" ||
    raw.url.length === 0 ||
    typeof raw.storageKey !== "string" ||
    raw.storageKey.length === 0
  ) {
    throw new Error("Invalid upload signing response")
  }

  return {
    url: raw.url,
    storageKey: raw.storageKey
  }
}

export function getHttpStatus(
  error: unknown,
  response?: { status: number }
): number | undefined {
  if (
    isRecord(error) &&
    typeof error.status === "number" &&
    Number.isFinite(error.status)
  ) {
    return error.status
  }

  return response?.status
}

export function hasSuccessfulUpload(result: {
  successful?: readonly unknown[]
}): boolean {
  return (result.successful?.length ?? 0) > 0
}
