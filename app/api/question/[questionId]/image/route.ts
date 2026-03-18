import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function GET(
  _request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await context.params
    const response = await fetch(`${TEST_BASE_URL}/question/${questionId}/image`, {
      method: "GET",
      cache: "no-store",
    })

    const body = await response.arrayBuffer()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
      },
    })
  } catch {
    return NextResponse.json({ message: "Failed to load question image" }, { status: 500 })
  }
}
