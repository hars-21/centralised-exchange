import "dotenv/config";

function readRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required env variable: ${name}`);
	return value;
}

export const env = {
	port: Number(process.env.PORT ?? 3000),
	websocketPort: Number(process.env.WEBSOCKET_PORT ?? 8080),
	redisUrl: readRequiredEnv("REDIS_URL"),
	databaseUrl: readRequiredEnv("DATABASE_URL"),
	jwtSecret: readRequiredEnv("JWT_SECRET"),
	incomingQueue: process.env.INCOMING_QUEUE ?? "backend-to-engine-broker",
	responseQueue: `response-queue-${process.env.BACKEND_QUEUE_ID ?? crypto.randomUUID()}`,
	depthQueue: process.env.DEPTH_QUEUE ?? "depth-changes",
	engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? 30000),
};
