import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que no necesitan autenticación
const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
	const userCookie = request.cookies.get("user");
	const isAuthenticated = !!userCookie;
	const path = request.nextUrl.pathname;

	// Si la ruta es pública, permitir acceso
	if (publicRoutes.includes(path)) {
		// Si está autenticado y va al login, redirigir al dashboard
		if (isAuthenticated && path === "/login") {
			return NextResponse.redirect(new URL("/", request.url));
		}
		return NextResponse.next();
	}

	// Si no está autenticado y la ruta requiere autenticación, redirigir al login
	if (!isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
