import { createClient } from "redis";
import type { EngineCommandType, EngineResponse } from "../types/engine";
import { resolveEngineResponse, waitForEngineResponse } from "../store/pendingResponses";

export const QUEUE_ID = crypto.randomUUID();

const publisher = createClient().on("error", (err) => console.log("Redis client error: ", err));

const subscriber = createClient().on("error", (err) => console.log("Redis client error: ", err));

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
	const responsePromise = waitForEngineResponse(correlationId);

	const message = {
		correlationId,
		responseQueue: QUEUE_ID,
		type,
		payload,
	};

	await publisher.lPush("incoming-order", JSON.stringify(message));
	return responsePromise;
}

export async function listenForEngineresponses(): Promise<void> {
	while (1) {
		const response = await subscriber.brPop(QUEUE_ID, 1);
		if (!response) continue;

		try {
			const parsedResponse = JSON.parse(response.element);
			resolveEngineResponse(parsedResponse);
		} catch (e) {
			console.error("Invalid engine response: ", e);
		}
	}
}
