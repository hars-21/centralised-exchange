import { handleEngineRequest } from "./handler";
import type { EngineRequest, EngineResponse } from "./types/engine";
import { connectRedis, publisher, subscriber } from "./redis/client";
import { env } from "./utils/env";

let lastID = "0-0";

await connectRedis();
console.log(`Engine listening on Redis queue: ${env.incomingStream}`);

async function sendResponse(responseQueue: string, response: EngineResponse) {
	await publisher.lPush(responseQueue, JSON.stringify(response));
}

while (1) {
	const items = await subscriber.xRead({
		key: env.incomingStream,
		id: lastID,
	});

	if (!items) continue;

	for (const message of items[0]?.messages) {
		lastID = message.id;
		const msg = message.message;

		let request: EngineRequest;

		try {
			request = {
				correlationId: msg.correlationId,
				responseQueue: msg.responseQueue,
				type: msg.type,
				payload: JSON.parse(msg.payload),
			};
		} catch (err) {
			console.error("Skipping invalid broker message");
			continue;
		}

		try {
			const data = handleEngineRequest(request);
			await sendResponse(request.responseQueue, {
				correlationId: request.correlationId,
				success: true,
				data,
			});
		} catch (error) {
			await sendResponse(request.responseQueue, {
				correlationId: request.correlationId,
				success: false,
				error: error instanceof Error ? error.message : "engine_error",
			});
		}
	}
}
