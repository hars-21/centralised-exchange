import { createClient } from "redis";
import type { EngineCommandType, EngineResponse } from "../types/engine";
import { resolveEngineResponse, waitForEngineResponse } from "../store/pendingResponses";
import { activeSubscriptions } from "./websocket";
import { env } from "./env";

const publisher = createClient({ url: env.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

const subscriber = createClient({ url: env.redisUrl }).on("error", (err) =>
	console.log("Redis client error: ", err),
);

export async function connectRedis() {
	return Promise.all([publisher.connect(), subscriber.connect()]);
}

export async function pingRedis() {
	return publisher.ping();
}

export async function sendToEngine(
	type: EngineCommandType,
	payload: Record<string, unknown>,
): Promise<EngineResponse> {
	const correlationId = crypto.randomUUID();
	const responsePromise = waitForEngineResponse(correlationId, env.engineTimeoutMs);

	await publisher.xAdd(env.incomingStream, "*", {
		correlationId,
		responseQueue: env.responseQueue,
		type,
		payload: JSON.stringify(payload),
	});

	return responsePromise;
}

export async function listenForEngineresponses(): Promise<void> {
	console.log(`Listening for engine responses on ${env.responseQueue}`);

	for (;;) {
		const response = await subscriber.brPop(env.responseQueue, 0);
		if (!response?.element) continue;

		try {
			const parsedResponse = JSON.parse(response.element);
			resolveEngineResponse(parsedResponse);
		} catch (err) {
			console.error("Invalid engine response: ", err);
		}
	}
}

export async function listenForOrderbookDepth(): Promise<void> {
	await subscriber.pSubscribe(["depth:*", "trade:*", "candle:*"], (message, channel) => {
		try {
			const parsedData = JSON.parse(message);

			activeSubscriptions[channel]?.forEach((ws) => {
				ws.send(JSON.stringify(parsedData));
			});
		} catch (err) {
			console.error("Invalid depth message:", err);
		}
	});
}
