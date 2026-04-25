import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teacherId: string }> },
) {
  try {
    const authorization = request.headers.get("authorization")
    const { teacherId } = await params

    const response = await fetch(`${TEST_BASE_URL}/test/user/${teacherId}`, {
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
    return NextResponse.json({ message: "Failed to load teacher tests" }, { status: 500 })
  }
}
