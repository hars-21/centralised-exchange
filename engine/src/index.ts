import { handleEngineRequest } from "./handler";
import type { EngineRequest, EngineResponse } from "./types/request";
import { connectRedis, disconnectRedis, publisher, subscriber } from "./redis/client";
import { config } from "./config";

const abortController = new AbortController();
let lastID = "0-0";

await connectRedis();
console.log(`Engine listening on Redis queue: ${config.incomingStream}`);

async function sendResponse(responseQueue: string, response: EngineResponse) {
	await publisher.lPush(responseQueue, JSON.stringify(response));
}

async function processMessages() {
	const signal = abortController.signal;

	for (;;) {
		if (signal.aborted) break;

		try {
			const streams = await subscriber.xRead(
				{
					key: config.incomingStream,
					id: lastID,
				},
				{
					BLOCK: 5000,
				},
			);

			if (signal.aborted) break;
			if (!streams) continue;

			for (const stream of streams) {
				const responses: { queue: string; payload: EngineResponse }[] = [];

				for (const message of stream.messages) {
					const msg = message.message;
					let request: EngineRequest;
					lastID = message.id;

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
				}

				for (const response of responses) {
					sendResponse(response.queue, response.payload);
				}
			}
		} catch (err) {
			if (signal.aborted) break;
			console.error("Stream read error:", err);
		}
	}
}

processMessages().catch((err) => console.error("Engine process error:", err));

async function gracefulShutdown(signal: string) {
	console.log(`Received ${signal}, shutting down...`);

	const forceExit = setTimeout(() => {
		console.error("Graceful shutdown timed out, forcing exit");
		process.exit(1);
	}, 10000);

	abortController.abort();
	await disconnectRedis();

	clearTimeout(forceExit);
	process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
