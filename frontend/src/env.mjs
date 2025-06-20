import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		BACKEND_HOST: z.string().min(1),
	},

	client: {
		NEXT_PUBLIC_APP_NAME: z.string().optional(),
		NEXT_PUBLIC_GOOGLE_MAP_API_KEY: z.string().optional().default(""),
		NEXT_PUBLIC_HOST: z.string().optional().default("http://localhost:4141"),
	},

	// Mapeo explícito de las variables
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		BACKEND_HOST: process.env.BACKEND_HOST,
		NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
		NEXT_PUBLIC_GOOGLE_MAP_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
		NEXT_PUBLIC_HOST: process.env.NEXT_PUBLIC_HOST,
	},
});
