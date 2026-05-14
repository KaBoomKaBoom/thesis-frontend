import { NextResponse } from "next/server"
import { TEST_BASE_URL } from "@/lib/api-config"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${TEST_BASE_URL}/extraction/upload-pdf`, {
      method: "POST",
      body: formData,
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
    return NextResponse.json({ message: "Failed to upload test PDF" }, { status: 500 })
  }
}
