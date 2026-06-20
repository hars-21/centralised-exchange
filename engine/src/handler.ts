import { getUserBalance } from "./balance";
import { cancelOrder, getOpenOrders, getOrder, placeOrder } from "./engine";
import { getDepth } from "./orderbook";
import type { EngineRequest } from "./types/engine";
import {
	orderIdPayloadSchema,
	orderPayloadSchema,
	symbolPayloadSchema,
	userPayloadSchema,
} from "./types/order";

export function handleEngineRequest(message: EngineRequest) {
	if (message.type === "create_order") {
		const parsedPayload = orderPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid order payload");
		}

		return placeOrder(parsedPayload.data);
	} else if (message.type === "get_depth") {
		const parsedPayload = symbolPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid symbol");
		}

		const { symbol } = parsedPayload.data;

		return getDepth(symbol);
	} else if (message.type === "get_user_balance") {
		const parsedPayload = userPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid userId");
		}

		const { userId } = parsedPayload.data;

		return getUserBalance(userId);
	} else if (message.type === "get_order") {
		const parsedPayload = orderIdPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid OrderId");
		}

		const { userId, orderId } = parsedPayload.data;

		return getOrder(userId, orderId);
	} else if (message.type === "get_open_orders") {
		const parsedPayload = userPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid userId");
		}

		const { userId } = parsedPayload.data;

		return getOpenOrders(userId);
	} else if (message.type === "cancel_order") {
		const parsedPayload = orderIdPayloadSchema.safeParse(message.payload);

		if (!parsedPayload.success) {
			throw new Error("Invalid OrderId");
		}

		const { userId, orderId } = parsedPayload.data;

		return cancelOrder(userId, orderId);
	} else {
		throw new Error("Unknown message type");
	}
}
