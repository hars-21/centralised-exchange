import { getBestAsk, getBestBid } from "./orderbook";
import { BALANCES, ORDERS } from "./store";
import type { CreateOrderInput, OrderRecord, Fill, UserBalance } from "./types/store";

export function getUserBalance(userId: string): UserBalance {
	if (!BALANCES[userId]) {
		BALANCES[userId] = {
			INR: {
				available: 10000,
				locked: 0,
			},
			BTC: {
				available: 100,
				locked: 0,
			},
		};
	}

	return BALANCES[userId];
}

export function lockBalance(order: CreateOrderInput): number {
	const { userId, side, type, symbol, price, qty } = order;

	if (!BALANCES[userId]) {
		BALANCES[userId] = {
			INR: { available: 0, locked: 0 },
		};
	}

	if (!BALANCES[userId][symbol]) {
		BALANCES[userId][symbol] = {
			available: 0,
			locked: 0,
		};
	}

	if (side === "BUY") {
		const currencyBalance = BALANCES[userId].INR!;

		let lockAmount = 0;

		if (type === "LIMIT") {
			if (price == null) {
				throw new Error("LIMIT order must have price");
			}

			lockAmount = price * qty;
		} else {
			const bestAsk = getBestAsk(symbol);

			if (bestAsk == null) {
				throw new Error("No liquidity");
			}

			lockAmount = bestAsk * qty * 1.1;
		}

		if (currencyBalance.available < lockAmount) {
			throw new Error("Insufficient balance");
		}

		currencyBalance.available -= lockAmount;
		currencyBalance.locked += lockAmount;

		return lockAmount;
	} else {
		const stockBalance = BALANCES[userId][symbol]!;

		if (type === "MARKET" && getBestBid(symbol) == null) {
			throw new Error("No liquidity");
		}

		if (stockBalance.available < qty) {
			throw new Error("Insufficient balance");
		}

		stockBalance.available -= qty;
		stockBalance.locked += qty;

		return qty;
	}
}

export function settleTrades(fills: Fill[]) {
	fills.forEach((fill) => {
		const { buyOrderId, sellOrderId, qty, price } = fill;

		const buyOrder = ORDERS.find((order) => order.orderId === buyOrderId);
		const sellOrder = ORDERS.find((order) => order.orderId === sellOrderId);

		if (!buyOrder || !sellOrder) {
			throw new Error("Invalid Trade");
		}

		// Currency Balance
		let buyerBalance = BALANCES[buyOrder.userId]!.INR!;
		let sellerBalance = BALANCES[sellOrder.userId]!.INR!;

		// Stock Balance
		let buyerStockBalance = BALANCES[buyOrder.userId]![buyOrder.symbol] ?? {
			available: 0,
			locked: 0,
		};
		let sellerStockBalance = BALANCES[sellOrder.userId]![sellOrder.symbol]!;

		// Currency Transfer
		buyerBalance.locked -= qty * price;
		sellerBalance.available += qty * price;

		// Stock Transfer
		buyerStockBalance.available += qty;
		sellerStockBalance.locked -= qty;

		BALANCES[buyOrder.userId]![buyOrder.symbol] = buyerStockBalance;
	});
}

export function releaseBalance(order: OrderRecord) {
	const { userId, side, symbol, lockedAmount, qty, filledQty, fills } = order;

	if (side === "BUY") {
		const totalAmount = fills.reduce((total, fill) => total + fill.price, 0) * filledQty;
		const remainingAmount = lockedAmount - totalAmount;
		const currencyBalance = BALANCES[userId]!.INR!;

		if (currencyBalance.locked < remainingAmount) {
			throw new Error("Insufficient Locked Balance");
		}

		currencyBalance.available += remainingAmount;
		currencyBalance.locked -= remainingAmount;

		return remainingAmount;
	} else {
		const remainingQty = qty - filledQty;
		const stockBalance = BALANCES[userId]![symbol]!;

		if (stockBalance.locked < remainingQty) {
			throw new Error("Insufficient Locked Balance");
		}

		stockBalance.available += remainingQty;
		stockBalance.locked -= remainingQty;

		return remainingQty;
	}
}
