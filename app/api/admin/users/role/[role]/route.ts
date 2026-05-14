import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api-config"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ role: string }> },
) {
  try {
    const authorization = request.headers.get("authorization")
    const { role } = await params

    const response = await fetch(`${API_BASE_URL}/api/admin/users/role/${role}`, {
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
    return NextResponse.json({ message: "Failed to load users by role" }, { status: 500 })
  }
}
