const USER_ID_CLAIM_CANDIDATES = [
  "nameid",
  "nameidentifier",
  "sub",
  "userId",
  "id",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
] as const

function decodeBase64Url(payload: string): string {
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4))
  return atob(normalized + padding)
}

function parseNumericClaim(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

export function getUserIdFromJwt(token: string | null): number | null {
  if (!token) return null

  const parts = token.split(".")
  if (parts.length < 2) return null

  try {
    const payloadString = decodeBase64Url(parts[1])
    const payload = JSON.parse(payloadString) as Record<string, unknown>

    for (const claim of USER_ID_CLAIM_CANDIDATES) {
      const parsed = parseNumericClaim(payload[claim])
      if (parsed !== null) {
        return parsed
      }
    }

    return null
  } catch {
    return null
  }
}
