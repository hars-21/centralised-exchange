import { getUserBalance } from "./balance";
import { cancelOrder, getOrder, placeOrder } from "./engine";
import { getDepth } from "./orderbook";
import type { EngineRequest } from "./types/engine";
import { orderPayloadSchema } from "./types/order";

export function handleEngineRequest(message: EngineRequest) {
	if (message.type === "create_order") {
		const parsedPayload = orderPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid Order Payload");
		}

		return placeOrder(parsedPayload.data);
	} else if (message.type === "get_depth") {
		const { symbol } = message.payload;

		if (typeof symbol !== "string") {
			throw new Error("Invalid symbol");
		}

		return getDepth(symbol);
	} else if (message.type === "get_user_balance") {
		const { userId } = message.payload;

		if (typeof userId !== "string") {
			throw new Error("Invalid User ID");
		}

		return getUserBalance(userId);
	} else if (message.type === "get_order") {
		const { userId, orderId } = message.payload;

		if (typeof userId !== "string") {
			throw new Error("Invalid User ID");
		}

		if (typeof orderId !== "string") {
			throw new Error("Invalid Order ID");
		}

		return getOrder(userId, orderId);
	} else if (message.type === "cancel_order") {
		const { userId, orderId } = message.payload;

		if (typeof userId !== "string") {
			throw new Error("Invalid User ID");
		}

		if (typeof orderId !== "string") {
			throw new Error("Invalid Order ID");
		}

		return cancelOrder(userId, orderId);
	} else {
		throw new Error("Unknown message type");
	}
}
