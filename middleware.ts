import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Protéger la route /api/product-count pour les requêtes POST
  if (request.nextUrl.pathname.startsWith("/api/product-count") && request.method === "POST") {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Dans une application réelle, vous vérifieriez la validité du token ici
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/product-count/:path*"],
}
