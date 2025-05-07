import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		// NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string().min(1) : z.string().min(1).optional(),
		// NEXTAUTH_URL: z.string().url(),
		BACKEND_HOST: z.string().min(1),
	},

	client: {
		NEXT_PUBLIC_APP_NAME: z.string().optional(),
		NEXT_PUBLIC_GOOGLE_MAP_API_KEY: z.string().optional().default(""),
		NEXT_PUBLIC_HOST: z.string().default("http://localhost:4141"),
	},
	runtimeEnv: process.env,
});
