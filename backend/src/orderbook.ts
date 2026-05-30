import { ORDERBOOK } from "./store";
import type { OrderRecord, RestingOrder } from "./types/engine";

export function getBestBid(symbol: string) {
	const bids = ORDERBOOK[symbol]!.bids;
	const bestBid = Math.max(...Object.keys(bids).map(Number));
	return bestBid;
}

export function getBestAsk(symbol: string) {
	const asks = ORDERBOOK[symbol]!.asks;
	const bestAsk = Math.min(...Object.keys(asks).map(Number));
	return bestAsk;
}

export function addOrderToBook(order: OrderRecord) {
	if (order.type === "MARKET" || !order.price) {
		return;
	}

	if (order.qty <= 0) {
		throw new Error("Invalid qty");
	}

	if (order.price <= 0) {
		throw new Error("Invalid price");
	}

	const orderSide = order.side === "BUY" ? "bids" : "asks";
	let priceLevel = ORDERBOOK[order.symbol]![orderSide][order.price];

	const newOrder: RestingOrder = {
		userId: order.userId,
		qty: order.qty,
		filledQty: order.filledQty,
		orderId: order.orderId,
		createdAt: order.createdAt,
	};

	if (priceLevel) {
		priceLevel.orders.push(newOrder);
		priceLevel.totalQty += order.qty - order.filledQty;
	} else {
		ORDERBOOK[order.symbol]![orderSide][order.price] = {
			totalQty: order.qty - order.filledQty,
			orders: [newOrder],
		};
	}
}

// TODO
export function removeOrderFromBook(order: OrderRecord) {}

export function getSymbolDepth(symbol: string) {
	const orderbook = ORDERBOOK[symbol];

	if (!orderbook) {
		return {
			success: false,
			error: "Invalid symbol",
		};
	}

	return {
		symbol,
		...orderbook,
	};
}
