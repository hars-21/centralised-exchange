import { publishEvent } from "./redis/publish";
import { ORDERBOOK } from "./store";
import type { Depth, OrderRecord, PriceLevel, RestingOrder, Side } from "./types/domain";
import type { EventMessage } from "./types/event";

let LastUpdateID = 1;
let LastFillID = 1;

export function getBestBid(symbol: string) {
	const bids = ORDERBOOK[symbol]!.bids;
	const bidPrices = Object.keys(bids).map(Number);

	const bestBid = bidPrices.length > 0 ? Math.max(...bidPrices) : null;
	return bestBid;
}

export function getBestAsk(symbol: string) {
	const asks = ORDERBOOK[symbol]!.asks;
	const askPrices = Object.keys(asks).map(Number);

	const bestAsk = askPrices.length > 0 ? Math.min(...askPrices) : null;
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
	const priceLevel = ORDERBOOK[order.symbol]![orderSide][order.price];
	const remainingQty = order.qty - order.filledQty;

	if (priceLevel) {
		priceLevel.orders.push(order as RestingOrder);
		priceLevel.totalQty += remainingQty;
	} else {
		ORDERBOOK[order.symbol]![orderSide][order.price] = {
			totalQty: remainingQty,
			orders: [order as RestingOrder],
		};
	}
	publishDepth({
		symbol: order.symbol,
		price: order.price,
		qty: priceLevel?.totalQty ?? remainingQty,
		side: orderSide,
	});
}

export function removeOrderFromBook(order: OrderRecord) {
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
	const priceLevel = ORDERBOOK[order.symbol]![orderSide][order.price];

	if (!priceLevel) {
		throw new Error("Invalid price");
	}

	priceLevel.orders = priceLevel.orders.filter(
		(restingOrder: RestingOrder) => restingOrder.orderId !== order.orderId,
	);
	priceLevel.totalQty -= order.qty - order.filledQty;

	ORDERBOOK[order.symbol]![orderSide][order.price] = priceLevel;

	publishDepth({
		symbol: order.symbol,
		price: order.price,
		qty: priceLevel.totalQty,
		side: orderSide,
	});

	if (priceLevel.orders.length === 0) {
		delete ORDERBOOK[order.symbol]![orderSide][order.price];
	}
}

export function getDepth(symbol: string) {
	const orderbook = ORDERBOOK[symbol];

	if (!orderbook) {
		throw new Error("Invalid symbol");
	}

	const bids: Record<string, PriceLevel> = orderbook.bids;

	const bidsArr = Object.entries(bids).map(([price, level]) => ({
		price: Number(price),
		qty: level.totalQty,
	}));
	bidsArr.sort((a, b) => b.price - a.price);

	const asks: Record<string, PriceLevel> = orderbook.asks;

	const asksArr = Object.entries(asks).map(([price, level]) => ({
		price: Number(price),
		qty: level.totalQty,
	}));
	asksArr.sort((a, b) => a.price - b.price);

	return {
		symbol,
		bids: bidsArr,
		asks: asksArr,
		lastUpdateId: LastUpdateID,
		timestamp: Date.now(),
	};
}

export function publishDepth({
	symbol,
	price,
	qty,
	side,
}: {
	symbol: string;
	price: number;
	qty: number;
	side: "bids" | "asks";
}) {
	const depth: Depth = {
		symbol,
		bids: [],
		asks: [],
	};

	depth[side].push({ price, qty });

	const message: EventMessage = {
		event: "depth",
		lastUpdateId: LastUpdateID++,
		timestamp: Date.now(),
		...depth,
	};

	void publishEvent(message).catch((err) => {
		console.error("Failed to publish depth", err);
	});
}

export function publishFill({
	symbol,
	price,
	qty,
	maker,
	timestamp,
}: {
	symbol: string;
	price: number;
	qty: number;
	maker: boolean;
	timestamp: number;
}) {
	const message: EventMessage = {
		event: "trade",
		symbol,
		price,
		qty,
		maker,
		id: LastFillID++,
		timestamp,
	};

	void publishEvent(message).catch((err) => {
		console.error("Failed to publish trade", err);
	});
}
