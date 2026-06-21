import { addOrderToBook, getBestAsk, getBestBid, publishDepth } from "./orderbook";
import { FILLS, ORDERBOOK } from "./store";
import type { OrderRecord } from "./types/domain";

export function matchOrder(order: OrderRecord) {
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

				FILLS.push(fill);
				order.fills.push(fill);
				restingOrder.fills.push(fill);

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
				publishDepth(order.symbol, bestPrice, priceLevel, matchSide);
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

				FILLS.push(fill);
				order.fills.push(fill);
				restingOrder.fills.push(fill);

				remainingQty = 0;
				publishDepth(order.symbol, bestPrice, priceLevel, matchSide);
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
