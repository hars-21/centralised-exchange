import { createClient } from "redis";
import { config } from "./config";

export const publisher = createClient({ url: config.redis.url }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const responsesubscriber = createClient({ url: config.redis.url }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export const marketSubscriber = createClient({ url: config.redis.url }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([
		publisher.connect(),
		responsesubscriber.connect(),
		marketSubscriber.connect(),
	]);
}

export async function pingRedis() {
	return publisher.ping();
}

export async function disconnectRedis() {
	await Promise.allSettled([marketSubscriber.pUnsubscribe(["depth:*", "trade:*", "candle:*"])]);

	await Promise.allSettled([publisher.quit(), responsesubscriber.quit(), marketSubscriber.quit()]);
}
