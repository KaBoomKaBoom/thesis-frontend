import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function GET(
  _request: Request,
  context: { params: Promise<{ testId: string }> },
) {
  try {
    const { testId } = await context.params
    const response = await fetch(`${TEST_BASE_URL}/test/${testId}`, {
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
    return NextResponse.json({ message: "Failed to load test" }, { status: 500 })
  }
}
