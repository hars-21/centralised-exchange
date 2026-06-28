import { createClient } from "redis";
import { config } from "./config";
import { logger } from "./logger";

export const publisher = createClient({ url: config.redisUrl }).on("error", (err) =>
	logger.error("Redis publisher error", { error: (err as Error).message }),
);

export const streamReader = createClient({ url: config.redisUrl }).on("error", (err) =>
	logger.error("Redis streamReader error", { error: (err as Error).message }),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), streamReader.connect()]);
}

export async function disconnectRedis() {
	await Promise.allSettled([publisher.quit(), streamReader.quit()]);
}
