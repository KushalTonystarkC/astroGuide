import { proxyToBackend } from "@/lib/vedic/backend-proxy"

type RouteContext = { params: Promise<{ path: string[] }> }

async function handle(request: Request, context: RouteContext) {
  const { path } = await context.params
  return proxyToBackend(path.join("/"), request)
}

export const GET = handle
export const POST = handle
