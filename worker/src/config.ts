import z from "zod";
import "dotenv/config";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),
	REDIS_URL: z.string(),
	DATABASE_URL: z.string(),
});

const env = envSchema.parse(process.env);

export const config = {
	env: env.NODE_ENV,
	redisUrl: env.REDIS_URL,
	dbUrl: env.DATABASE_URL,
};
