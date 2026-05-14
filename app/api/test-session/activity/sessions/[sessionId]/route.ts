import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api-config"

export async function GET(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params
    const authorization = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/api/testSession/activity/sessions/${sessionId}`, {
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
    return NextResponse.json({ message: "Failed to load test session details" }, { status: 500 })
  }
}
