import { createClient } from "redis";
import { env } from "../utils/env";

export const publisher = createClient({ url: env.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const subscriber = createClient({ url: env.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), subscriber.connect()]);
}
