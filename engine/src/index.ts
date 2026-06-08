import { handleEngineRequest } from "./handler";
import type { EngineRequest, EngineResponse } from "./types/engine";
import { connectRedis, publisher, subscriber } from "./redis/client";
import { env } from "./utils/env";

await connectRedis();
console.log(`Engine listening on Redis queue: ${env.incomingQueue}`);

async function sendResponse(responseQueue: string, response: EngineResponse) {
	await publisher.lPush(responseQueue, JSON.stringify(response));
}

while (1) {
	const item = await subscriber.brPop(env.incomingQueue, 1);
	if (!item) continue;

	let message: EngineRequest;

	try {
		message = JSON.parse(item.element);
	} catch (err) {
		console.error("Skipping invalid broker message");
		continue;
	}

	try {
		const data = handleEngineRequest(message);
		await sendResponse(message.responseQueue, {
			correlationId: message.correlationId,
			success: true,
			data,
		});
	} catch (error) {
		await sendResponse(message.responseQueue, {
			correlationId: message.correlationId,
			success: false,
			error: error instanceof Error ? error.message : "engine_error",
		});
	}
}
