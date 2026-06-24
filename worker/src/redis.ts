import { createClient } from "redis";

export const publisher = createClient({ url: process.env.REDIS_URL }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const streamReader = createClient({ url: process.env.REDIS_URL }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), streamReader.connect()]);
}
