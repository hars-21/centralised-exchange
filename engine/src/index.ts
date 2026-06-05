import { handleEngineRequest } from "./handler";
import { getDepth } from "./orderbook";
import { ORDERS } from "./store";
import type { EngineRequest, EngineResponse } from "./types/engine";
import { connectRedis, publisher, subscriber } from "./utils/connections";

await connectRedis();
console.log("Engine listening on Redis queue: incoming-order");

async function sendResponse(responseQueue: string, response: EngineResponse) {
	await publisher.lPush(responseQueue, JSON.stringify(response));
}

async function publishDepth(message: any) {
	await publisher.lPush("depth-changes", JSON.stringify(message));
}

while (1) {
	const item = await subscriber.brPop("incoming-order", 1);
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
