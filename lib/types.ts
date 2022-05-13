import type { NextPage } from "next"
import React from "react"

export type NextPageWithAuthAndLayout = NextPage & {
  auth?: boolean
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

export enum HttpMethod {
  CONNECT = "CONNECT",
  DELETE = "DELETE",
  GET = "GET",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
  PATCH = "PATCH",
  POST = "POST",
  PUT = "PUT",
  TRACE = "TRACE"
}

export enum frameSize {
  MOBILE = "MOBILE",
  DESKTOP = "DESKTOP"
}

export type WithClassName<T = {}> = T & {
  className?: string
}

declare global {
  var cloudinary: {
    applyUploadWidget: (
      element: unknown,
      options: CloudinaryWidgetOptions,
      widgetCallback?: Function
    ) => void
    createUploadWidget: (
      options: CloudinaryWidgetOptions,
      widgetCallback?: Function
    ) => CloudinaryWidget
    openUploadWidget: (
      options: CloudinaryWidgetOptions,
      widgetCallback?: Function
    ) => void
    setAPIKey: (key: string) => void
    setCloudName: (name: string) => void
    WIDGET_SOURCES: CloudinaryWidgetSource
    WIDGET_VERSION: string
  }
}

enum CloudinaryWidgetSource {
  CAMERA = "camera",
  DROPBOX = "dropbox",
  FACEBOOK = "facebook",
  GETTY = "getty",
  GOOGLE_DRIVE = "google_drive",
  IMAGE_SEARCH = "image_search",
  INSTAGRAM = "instagram",
  ISTOCK = "istock",
  LOCAL = "local",
  SHUTTERSTOCK = "shutterstock",
  UNSPLASH = "unsplash",
  URL = "url"
}

export interface CloudinaryWidget {
  close: (t?: unknown) => void
  destroy: (t?: unknown) => void
  hide: () => void
  isDestroyed: () => void
  isMinimized: () => void
  isShowing: () => void
  minimize: () => void
  open: (t?: unknown, e?: unknown) => void
  show: () => void
  update: (t?: unknown) => void
}

interface CloudinaryWidgetOptions {
  cloudName: string
  cropping: boolean
  uploadPreset: string
  styles: object
}

export interface CloudinaryWidgetResult {
  data: {
    event: string
    info: string
  }
  event: string
  info: CloudinaryCallbackImage
  uw_event: boolean
}

export interface CloudinaryCallbackImage {
  asset_id: string
  batchId: string
  bytes: number
  created_at: Date
  etag: string
  format: string
  height: number
  id: string
  original_filename: string
  path: string
  placeholder: boolean
  public_id: string
  resource_type: string
  secure_url: string
  signature: string
  tags: Array<string>
  thumbnail_url: string
  type: string
  url: string
  version_id: string
  version: number
  width: number
}

export interface ImageInfo {
  imageURL: string
  imageBlurhash: string
}

export const FONTS = [
  "Alfa Slab One",
  "Archivo Black",
  "Arvo",
  "Bebas Neue",
  "Bitter",
  "Comfortaa",
  "Cookie",
  "Creepster",
  "Federo",
  "Fugaz One",
  "Homemade Apple",
  "Inter",
  "Merriweather",
  "Montserrat",
  "Neuton",
  "Open Sans",
  "Pacifico",
  "Parisienne",
  "Permanent Marker",
  "Playfair Display",
  "Poiriet One",
  "Raleway",
  "Roboto Slab",
  "Roboto",
  "Sacramento",
  "Send Flowers",
  "Source Sans Pro",
  "Source Serif Pro",
  "Space Grotesk",
  "Space Mono",
  "Special Elite",
  "Square Peg"
]

export const COLORS = [
  "#f6e58d",
  "#f9ca24",
  "#ffbe76",
  "#ff7979",
  "#eb4d4b",
  "#badc58",
  "#6ab04c",
  "#7ed6df",
  "#22a6b3",
  "#e056fd",
  "#be2edd",
  "#686de0",
  "#4834d4",
  "#30336b",
  "#130f40",
  "#636e72",
  "#2d3436",
  "#ffffff"
]
