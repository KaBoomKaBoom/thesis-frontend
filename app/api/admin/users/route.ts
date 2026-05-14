import { NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api-config"

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization")

    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
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
    return NextResponse.json({ message: "Failed to load users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization")
    const body = await request.text()

    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        "Content-Type": request.headers.get("content-type") || "application/json",
      },
      body,
    })

    const payload = await response.text()

    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    })
  } catch {
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
  }
}
