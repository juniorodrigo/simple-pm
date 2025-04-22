import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

const BACKEND_HOST = env.BACKEND_HOST;
const TIMEOUT_MS = 30000;

async function handleRequest(request: NextRequest) {
	const url = new URL(request.url);
	const backendUrl = `${BACKEND_HOST}${url.pathname.replace(/^\/api\/is/, "")}${url.search}`;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

	console.log("Proxying request to:", backendUrl);

	try {
		const response = await fetch(backendUrl, {
			method: request.method,
			headers: request.headers,
			signal: controller.signal,
			body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
			//@ts-expect-error: "duplex" para corrección de eerror al pasar body al proxy
			duplex: "half",
		});

		clearTimeout(timeoutId);

		// Mantener el streaming de datos
		return new NextResponse(response.body, {
			status: response.status,
			headers: {
				"content-type": response.headers.get("content-type") || "application/json",
				"cache-control": "no-cache",
			},
		});
	} catch (error) {
		clearTimeout(timeoutId);
		console.error("Error en el proxy:", error);

		return NextResponse.json({ error: "Error en la conexión con el servidor" }, { status: 502 });
	}
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
