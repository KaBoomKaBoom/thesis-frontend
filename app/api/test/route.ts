import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    const { search } = new URL(request.url)
    const response = await fetch(`${TEST_BASE_URL}/test${search}`, {
      method: "GET",
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
    return NextResponse.json({ message: "Failed to load tests" }, { status: 500 })
  }
}
