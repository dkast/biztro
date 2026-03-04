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

/** @deprecated Use SubscriptionStatus instead */
export const enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DUE = "DUE"
}

export const enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED"
}
