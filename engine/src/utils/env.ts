import "dotenv/config";

function readRequiredEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required env variable: ${name}`);
	return value;
}

export const env = {
	redisUrl: readRequiredEnv("REDIS_URL"),
	incomingStream: process.env.INCOMING_STREAM ?? "backend-to-engine-broker",
};
