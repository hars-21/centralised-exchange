import { getBestAsk } from "./orderbook";
import { BALANCES, ORDERS } from "./store";
import type { CreateOrderInput, OrderRecord, Trade, UserBalance } from "./types/engine";

export function initWallet(userId: string) {
	BALANCES[userId] = {
		INR: {
			available: 0,
			locked: 0,
		},
	};

	return BALANCES[userId];
}

export function getUserBalance(userId: string): UserBalance {
	if (!BALANCES[userId]) {
		BALANCES[userId] = {
			INR: {
				available: 0,
				locked: 0,
			},
		};
	}

	return BALANCES[userId];
}

export function lockBalance(order: CreateOrderInput) {
	const { userId, side, symbol, price, qty } = order;

	if (!BALANCES[userId]) {
		BALANCES[userId] = { INR: { available: 0, locked: 0 }, [symbol]: { available: 0, locked: 0 } };
	}

	if (side === "BUY") {
		let currencyBalance = BALANCES[userId].INR ?? { available: 0, locked: 0 };
		let amount = price ?? getBestAsk(symbol);
		let totalAmount = amount * qty;

		if (currencyBalance.available >= totalAmount) {
			currencyBalance.available -= totalAmount;
			currencyBalance.locked += totalAmount;

			BALANCES[userId].INR = currencyBalance;
		} else {
			throw new Error("Insufficient Balance");
		}
	} else {
		let stockBalance = BALANCES[userId][symbol] ?? { available: 0, locked: 0 };
		if (stockBalance.available >= qty) {
			stockBalance.available -= qty;
			stockBalance.locked += qty;

			BALANCES[userId][symbol] = stockBalance;
		} else {
			throw new Error("Insufficient Balance");
		}
	}
}

export function settleTrades(trades: Trade[]) {
	trades.forEach((trade) => {
		const { buyOrderId, sellOrderId, qty, price } = trade;

		const buyOrder = ORDERS.find((order) => order.orderId === buyOrderId);
		const sellOrder = ORDERS.find((order) => order.orderId === sellOrderId);

		if (!buyOrder || !sellOrder) {
			throw new Error("Invalid Trade");
		}

		// Currency Balance
		let buyerBalance = BALANCES[buyOrder.userId]!.INR!;
		let sellerBalance = BALANCES[buyOrder.userId]!.INR ?? { available: 0, locked: 0 };

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

		BALANCES[buyOrder.userId]!.INR = buyerBalance;
		BALANCES[buyOrder.userId]!.INR = sellerBalance;
		BALANCES[buyOrder.userId]![buyOrder.symbol] = buyerStockBalance;
		BALANCES[sellOrder.userId]![sellOrder.symbol] = sellerStockBalance;
	});
}

export function releaseBalance(order: OrderRecord) {
	const { userId, side, symbol, price, qty, filledQty } = order;

	const remainingQty = qty - filledQty;

	if (side === "BUY") {
		let currencyBalance = BALANCES[userId]!.INR ?? { available: 0, locked: 0 };
		let amount = price ?? getBestAsk(symbol);
		let remainingAmount = amount * remainingQty;

		if (currencyBalance.locked >= remainingAmount) {
			currencyBalance.available += remainingAmount;
			currencyBalance.locked -= remainingAmount;

			BALANCES[userId]!.INR = currencyBalance;
		} else {
			throw new Error("Insufficient Locked Balance");
		}
	} else {
		let stockBalance = BALANCES[userId]![symbol] ?? { available: 0, locked: 0 };
		if (stockBalance.locked >= remainingQty) {
			stockBalance.available += remainingQty;
			stockBalance.locked -= remainingQty;

			BALANCES[userId]![symbol] = stockBalance;
		} else {
			throw new Error("Insufficient Locked Balance");
		}
	}
}
