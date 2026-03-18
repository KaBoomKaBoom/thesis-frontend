import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const body = await request.text()

    const response = await fetch(`${TEST_BASE_URL}/test/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    return NextResponse.json({ message: "Failed to generate test" }, { status: 500 })
  }
}
