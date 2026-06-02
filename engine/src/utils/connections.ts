import { createClient } from "redis";

export const publisher = createClient().on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const subscriber = createClient().on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), subscriber.connect()]);
}
