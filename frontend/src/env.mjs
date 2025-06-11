import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

console.log("process.env", process.env);

console.log("NEXT_PUBLIC_HOST from process.env:", process.env.NEXT_PUBLIC_HOST);

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		BACKEND_HOST: z.string().min(1),
	},

	client: {
		NEXT_PUBLIC_APP_NAME: z.string().optional(),
		NEXT_PUBLIC_GOOGLE_MAP_API_KEY: z.string().optional().default(""),
		NEXT_PUBLIC_HOST: z.string().optional().default("http://localhost:3000"),
	},
	runtimeEnv: process.env,
});
