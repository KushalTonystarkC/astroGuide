import { NextResponse } from "next/server"

export function getBackendUrl(): string {
  return (process.env.BACKEND_URL ?? "http://localhost:8001").replace(/\/$/, "")
}

export async function proxyToBackend(
  path: string,
  request: Request
): Promise<NextResponse> {
  const incoming = new URL(request.url)
  const target = new URL(`${getBackendUrl()}/api/${path}`)
  target.search = incoming.search

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType) {
    headers.set("content-type", contentType)
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text()
  }

  const response = await fetch(target.toString(), init)
  const responseContentType =
    response.headers.get("content-type") ?? "application/json"

  const body = await response.arrayBuffer()

  const outHeaders = new Headers()
  outHeaders.set("content-type", responseContentType)

  const disposition = response.headers.get("content-disposition")
  if (disposition) {
    outHeaders.set("content-disposition", disposition)
  }

  return new NextResponse(body, {
    status: response.status,
    headers: outHeaders,
  })
}
