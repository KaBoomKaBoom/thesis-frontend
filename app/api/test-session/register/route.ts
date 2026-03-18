import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const authorization = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/api/testSession/testSession`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
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
    return NextResponse.json({ message: "Failed to register test session" }, { status: 500 })
  }
}
