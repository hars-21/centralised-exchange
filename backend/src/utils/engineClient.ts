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

	const message = {
		correlationId,
		responseQueue: env.responseQueue,
		type,
		payload,
	};

	await publisher.lPush(env.incomingQueue, JSON.stringify(message));
	return responsePromise;
}

export async function listenForEngineresponses(): Promise<void> {
	console.log(`Listening for engine responses on ${env.responseQueue}`);

	while (1) {
		const response = await subscriber.brPop(env.responseQueue, 1);
		if (!response) continue;

		try {
			const parsedResponse = JSON.parse(response.element);
			resolveEngineResponse(parsedResponse);
		} catch (err) {
			console.error("Invalid engine response: ", err);
		}
	}
}

export async function listenForOrderbookDepth(): Promise<void> {
	console.log(`Listening for market data on ${env.depthQueue}`);

	while (1) {
		const data = await subscriber.brPop(env.depthQueue, 1);
		if (!data) continue;

		try {
			const parsedData = JSON.parse(data.element);

			activeSubscriptions[parsedData.symbol]?.forEach((ws) => {
				ws.send(JSON.stringify(parsedData));
			});
		} catch (err) {
			console.error("Invalid engine response: ", err);
		}
	}
}
