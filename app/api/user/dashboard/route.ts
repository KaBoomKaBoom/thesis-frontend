import { NextResponse } from "next/server"
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user.dashboard}`, {
      method: "GET",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
      },
      cache: "no-store",
    })

    const payload = await response.text()

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    })
  } catch {
    return NextResponse.json({ message: "Failed to load dashboard data" }, { status: 500 })
  }
}
