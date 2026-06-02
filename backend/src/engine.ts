import { lockBalance, releaseBalance, settleTrades } from "./balances";
import { addOrderToBook, getBestAsk, getBestBid, removeOrderFromBook } from "./orderbook";
import { ORDERBOOK, ORDERS } from "./store";
import type { CreateOrderInput, OrderRecord, Trade } from "./types/engine";
import { v4 as uuidv4 } from "uuid";

export function placeOrder(orderInput: CreateOrderInput) {
	lockBalance(orderInput);

	const order: OrderRecord = {
		...orderInput,
		orderId: uuidv4(),
		filledQty: 0,
		status: "PENDING",
		createdAt: Date.now(),
	};

	ORDERS.push(order);

	const trades = order.side === "BUY" ? matchBuyOrder(order) : matchSellOrder(order);

	if (trades.length > 0) {
		settleTrades(trades);
	}

	if (orderInput.type === "MARKET") {
		releaseBalance(order);
	}

	return {
		orderId: order.orderId,
		status: order.status,
		filledQty: order.filledQty,
		remainingQty: order.qty - order.filledQty,
	};
}

export function fetchOrder(userId: string, orderId: string) {
	const order = ORDERS.find((order) => {
		order.orderId === orderId && order.userId === userId;
	});

	return order;
}

export function deleteOrder(orderId: string, userId: string) {
	const order = ORDERS.find((order) => order.orderId === orderId && order.userId === userId);

	if (!order) throw new Error("Invalid orderId");

	removeOrderFromBook(order);

	const releasedFunds = releaseBalance(order);

	order.status = "CANCELLED";

	return {
		orderId: order.orderId,
		status: order.status,
		releasedFunds,
		remainingQty: order.qty - order.filledQty,
	};
}

function matchBuyOrder(order: OrderRecord): Trade[] {
	let remainingQty = order.qty - order.filledQty;
	const asks = ORDERBOOK[order.symbol]?.asks ?? {};
	let trades: Trade[] = [];

	while (remainingQty > 0) {
		const bestAskPrice = getBestAsk(order.symbol);
		if (bestAskPrice === undefined) break;

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
				order.status = "PARTIALLY_FILLED";

				trades.push({
					buyOrderId: order.orderId,
					sellOrderId: restingOrder.orderId,
					qty: availableQty,
					price: bestAskPrice,
				});

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
			} else {
				restingOrder.filledQty += remainingQty;
				priceLevel.totalQty -= remainingQty;

				order.filledQty += remainingQty;
				order.status = "FILLED";

				trades.push({
					buyOrderId: order.orderId,
					sellOrderId: restingOrder.orderId,
					qty: remainingQty,
					price: bestAskPrice,
				});

				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete asks[bestAskPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook(order);
	}

	return trades;
}

function matchSellOrder(order: OrderRecord): Trade[] {
	let remainingQty = order.qty - order.filledQty;
	const bids = ORDERBOOK[order.symbol]?.bids ?? {};
	let trades: Trade[] = [];

	while (remainingQty > 0) {
		const bestBidPrice = getBestBid(order.symbol);
		if (bestBidPrice === undefined) break;

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
				order.status = "PARTIALLY_FILLED";

				trades.push({
					buyOrderId: restingOrder.orderId,
					sellOrderId: order.orderId,
					qty: availableQty,
					price: bestBidPrice,
				});

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
			} else {
				restingOrder.filledQty += remainingQty;
				priceLevel.totalQty -= remainingQty;

				order.filledQty += remainingQty;
				order.status = "FILLED";

				trades.push({
					buyOrderId: restingOrder.orderId,
					sellOrderId: order.orderId,
					qty: remainingQty,
					price: bestBidPrice,
				});

				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete bids[bestBidPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook(order);
	}

	return trades;
}
