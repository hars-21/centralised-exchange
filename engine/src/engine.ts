import { lockBalance, releaseBalance, settleTrades } from "./balance";
import { addOrderToBook, getBestAsk, getBestBid, removeOrderFromBook } from "./orderbook";
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

	if (order.side === "BUY") {
		matchBuyOrder(order);
	} else {
		matchSellOrder(order);
	}

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

function matchBuyOrder(order: OrderRecord) {
	let remainingQty = order.qty - order.filledQty;

	while (remainingQty > 0) {
		const bestAskPrice = getBestAsk(order.symbol);
		if (bestAskPrice === null) break;

		if (order.type === "LIMIT") {
			if (order.price === null) {
				throw new Error("LIMIT order must have price");
			}

			if (bestAskPrice > order.price) {
				break;
			}
		}

		const priceLevel = ORDERBOOK[order.symbol]?.asks[bestAskPrice];
		if (!priceLevel) break;

		while (remainingQty > 0 && priceLevel.orders.length > 0) {
			const restingOrder = priceLevel.orders[0]!;
			const availableQty = restingOrder.qty - restingOrder.filledQty;

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
					price: bestAskPrice,
					qty: availableQty,
					buyOrderId: order.orderId,
					sellOrderId: restingOrder.orderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
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
					price: bestAskPrice,
					qty: remainingQty,
					buyOrderId: order.orderId,
					sellOrderId: restingOrder.orderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete ORDERBOOK[order.symbol]?.asks[bestAskPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook(order);
	}
}

function matchSellOrder(order: OrderRecord) {
	let remainingQty = order.qty - order.filledQty;

	while (remainingQty > 0) {
		const bestBidPrice = getBestBid(order.symbol);
		if (bestBidPrice === null) break;

		if (order.type === "LIMIT") {
			if (order.price === null) {
				throw new Error("LIMIT order must have price");
			}

			if (bestBidPrice < order.price) {
				break;
			}
		}

		const priceLevel = ORDERBOOK[order.symbol]?.bids[bestBidPrice];
		if (!priceLevel) break;

		while (remainingQty > 0 && priceLevel.orders.length > 0) {
			const restingOrder = priceLevel.orders[0]!;
			const availableQty = restingOrder.qty - restingOrder.filledQty;

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
					price: bestBidPrice,
					qty: availableQty,
					buyOrderId: restingOrder.orderId,
					sellOrderId: order.orderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
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
					price: bestBidPrice,
					qty: remainingQty,
					buyOrderId: restingOrder.orderId,
					sellOrderId: order.orderId,
					createdAt: Date.now(),
				};

				order.fills.push(fill);
				restingOrder.fills.push(fill);

				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete ORDERBOOK[order.symbol]?.bids[bestBidPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook(order);
	}
}
