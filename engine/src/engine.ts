import { lockBalance, releaseBalance, settleTrades } from "./balance";
import {
	addOrderToBook,
	getBestAsk,
	getBestBid,
	recordChanges,
	removeOrderFromBook,
} from "./orderbook";
import { ORDERBOOK, ORDERS } from "./store";
import type { CreateOrderInput, OrderRecord } from "./types/store";

export function placeOrder(orderInput: CreateOrderInput) {
	const lockedAmount = lockBalance(orderInput);

	const order: OrderRecord = {
		...orderInput,
		orderId: crypto.randomUUID(),
		filledQty: 0,
		status: "OPEN",
		fills: [],
		lockedAmount,
		createdAt: Date.now(),
	};

	ORDERS.push(order);

	matchOrder(order);

	if (order.fills.length > 0) {
		settleTrades(order.fills);
	}

	if (orderInput.type === "MARKET" || order.status === "FILLED") {
		releaseBalance(order);
	}

	const averagePrice =
		order.fills.length > 0
			? order.fills.reduce((total, fill) => total + fill.price * fill.qty, 0) / order.filledQty
			: null;

	return {
		orderId: order.orderId,
		status: order.status,
		filledQty: order.filledQty,
		averagePrice,
		fills: order.fills,
	};
}

export function getOrder(userId: string, orderId: string) {
	const order = ORDERS.find((order) => order.orderId === orderId && order.userId === userId);

	if (order === undefined) {
		throw new Error("Order not Found");
	}

	return order;
}

export function getOpenOrders(userId: string) {
	const orders = ORDERS.filter((order) => order.status === "OPEN" && order.userId === userId);

	return orders;
}

export function cancelOrder(userId: string, orderId: string) {
	const order = ORDERS.find((order) => order.orderId === orderId && order.userId === userId);

	if (!order) throw new Error("Order not Found");

	if (order.status === "FILLED") throw new Error("Filled orders cannot be cancelled");

	if (order.status === "CANCELLED") throw new Error("Order already cancelled");

	removeOrderFromBook(order);

	const releasedFunds = releaseBalance(order);

	order.status = "CANCELLED";

	return {
		orderId: order.orderId,
		status: order.status,
		qty: order.qty,
		filledQty: order.filledQty,
		releasedFunds,
	};
}

function matchOrder(order: OrderRecord) {
	let remainingQty = order.qty - order.filledQty;

	while (remainingQty > 0) {
		const bestPrice = order.side === "BUY" ? getBestAsk(order.symbol) : getBestBid(order.symbol);
		if (bestPrice === null) break;

		if (order.type === "LIMIT") {
			if (order.price === null) {
				throw new Error("LIMIT order must have price");
			}

			if (
				(order.side === "BUY" && bestPrice > order.price) ||
				(order.side === "SELL" && bestPrice < order.price)
			) {
				break;
			}
		}

		const matchSide = order.side === "BUY" ? "asks" : "bids";

		const priceLevel = ORDERBOOK[order.symbol]![matchSide][bestPrice];
		if (!priceLevel) break;

		while (remainingQty > 0 && priceLevel.orders.length > 0) {
			const restingOrder = priceLevel.orders[0]!;
			const availableQty = restingOrder.qty - restingOrder.filledQty;

			const buyOrderId = order.side === "BUY" ? order.orderId : restingOrder.orderId;
			const sellOrderId = order.side === "BUY" ? restingOrder.orderId : order.orderId;

			if (remainingQty >= availableQty) {
				remainingQty -= availableQty;
				restingOrder.filledQty += availableQty;

				order.filledQty += availableQty;
				order.status = remainingQty === 0 ? "FILLED" : "PARTIALLY_FILLED";
				restingOrder.status =
					restingOrder.qty === restingOrder.filledQty ? "FILLED" : "PARTIALLY_FILLED";

				const fill = {
					fillId: crypto.randomUUID(),
					symbol: order.symbol,
					price: bestPrice,
					qty: availableQty,
					buyOrderId,
					sellOrderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
				recordChanges(order.symbol, bestPrice, priceLevel, matchSide);
			} else {
				restingOrder.filledQty += remainingQty;
				priceLevel.totalQty -= remainingQty;

				order.filledQty += remainingQty;
				order.status = "FILLED";
				restingOrder.status =
					restingOrder.qty === restingOrder.filledQty ? "FILLED" : "PARTIALLY_FILLED";

				const fill = {
					fillId: crypto.randomUUID(),
					symbol: order.symbol,
					price: bestPrice,
					qty: remainingQty,
					buyOrderId,
					sellOrderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				remainingQty = 0;
				recordChanges(order.symbol, bestPrice, priceLevel, matchSide);
			}
		}

		if (priceLevel.orders.length === 0) {
			delete ORDERBOOK[order.symbol]![matchSide][bestPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook(order);
	}
}
