import { createClient } from "redis";
import { config } from "../config";

export const publisher = createClient({ url: config.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const subscriber = createClient({ url: config.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), subscriber.connect()]);
}

export async function disconnectRedis() {
	await Promise.allSettled([publisher.quit(), subscriber.quit()]);
}
