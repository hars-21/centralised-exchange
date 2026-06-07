import { handleEngineRequest } from "./handler";
import { getDepth } from "./orderbook";
import { ORDERS } from "./store";
import type { EngineRequest, EngineResponse } from "./types/engine";
import { connectRedis, publisher, subscriber } from "./redis/client";
import { env } from "./utils/env";

await connectRedis();
console.log(`Engine listening on Redis queue: ${env.incomingQueue}`);

async function sendResponse(responseQueue: string, response: EngineResponse) {
	await publisher.lPush(responseQueue, JSON.stringify(response));
}

async function publishDepth(message: any) {
	await publisher.lPush(env.depthQueue, JSON.stringify(message));
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

		if (message.type === "cancel_order") {
			const order = ORDERS.find(
				(order) =>
					order.orderId === message.payload.orderId && order.userId === message.payload.userId,
			);

			await publishDepth({
				stream: order?.symbol,
				data: getDepth(order?.symbol as string),
			});
		}

		if (message.type === "create_order") {
			await publishDepth({
				stream: message.payload.symbol,
				data: getDepth(message.payload.symbol as string),
			});
		}
	} catch (error) {
		await sendResponse(message.responseQueue, {
			correlationId: message.correlationId,
			success: false,
			error: error instanceof Error ? error.message : "engine_error",
		});
	}
}
