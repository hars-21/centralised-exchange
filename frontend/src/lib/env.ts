import z from "zod";

const envSchema = z.object({
	VITE_API_BASE_URL: z.string().default("http://localhost:8000"),
	VITE_WS_URL: z.string().default("ws://localhost:8080"),
});

const parsed = envSchema.parse(process.env);

export const config = {
	apiBaseUrl: parsed.VITE_API_BASE_URL,
	wsUrl: parsed.VITE_WS_URL,
};
