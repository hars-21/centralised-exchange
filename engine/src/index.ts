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

for (;;) {
	const streams = await subscriber.xRead(
		{
			key: env.incomingStream,
			id: lastID,
		},
		{
			BLOCK: 0,
		},
	);

	if (!streams) continue;

	for (const stream of streams ?? []) {
		const responses = [];

		for (const message of stream.messages) {
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
				responses.push({
					queue: request.responseQueue,
					payload: {
						correlationId: request.correlationId,
						success: true,
						data,
					},
				});
			} catch (error) {
				responses.push({
					queue: request.responseQueue,
					payload: {
						correlationId: request.correlationId,
						success: false,
						error: error instanceof Error ? error.message : "engine_error",
					},
				});
			}

			lastID = message.id;
		}

		for (const response of responses) {
			sendResponse(response.queue, response.payload);
		}
	}
}
