import { getBestAsk, getBestBid } from "./orderbook";
import { BALANCES, ORDERS } from "./store";
import type { CreateOrderInput, OrderRecord, Fill, UserBalance } from "./types/store";

function ensureAsset(userId: string, asset: string) {
	if (!BALANCES[userId]) {
		BALANCES[userId] = {};
	}

	if (!BALANCES[userId][asset]) {
		BALANCES[userId][asset] = { available: 0, locked: 0 };
	}

	return BALANCES[userId][asset]!;
}

export function getUserBalance(userId: string): UserBalance {
	if (!BALANCES[userId]) {
		BALANCES[userId] = {
			USD: { available: 10000, locked: 0 },
			BTC: { available: 100, locked: 0 },
			SOL: { available: 100, locked: 0 },
			ETH: { available: 100, locked: 0 },
		};
	}

	return BALANCES[userId];
}

export function lockBalance(order: CreateOrderInput): number {
	const { userId, side, type, symbol, price, qty } = order;
	const baseAsset = symbol.split("_")[0]!;

	const usd = ensureAsset(userId, "USD");
	const base = ensureAsset(userId, baseAsset);

	if (side === "BUY") {
		let lockAmount: number;

		if (type === "LIMIT") {
			if (price == null) throw new Error("LIMIT order must have price");
			lockAmount = price * qty;
		} else {
			const bestAsk = getBestAsk(symbol);
			if (bestAsk == null) throw new Error("No liquidity");
			lockAmount = bestAsk * qty * 1.1;
		}

		if (usd.available < lockAmount) {
			throw new Error("Insufficient balance");
		}

		usd.available -= lockAmount;
		usd.locked += lockAmount;

		return lockAmount;
	} else {
		if (type === "MARKET" && getBestBid(symbol) == null) {
			throw new Error("No liquidity");
		}

		if (base.available < qty) {
			throw new Error("Insufficient balance");
		}

		base.available -= qty;
		base.locked += qty;

		return qty;
	}
}

export function settleTrades(fills: Fill[]) {
	for (const fill of fills) {
		const { buyOrderId, sellOrderId, qty, price } = fill;

		const buyOrder = ORDERS.find((o) => o.orderId === buyOrderId);
		const sellOrder = ORDERS.find((o) => o.orderId === sellOrderId);

		if (!buyOrder || !sellOrder) throw new Error("Invalid Trade");

		const base = buyOrder.symbol.split("_")[0]!;

		const buyerUSD = ensureAsset(buyOrder.userId, "USD");
		const sellerUSD = ensureAsset(sellOrder.userId, "USD");

		const buyerBase = ensureAsset(buyOrder.userId, base);
		const sellerBase = ensureAsset(sellOrder.userId, base);

		// USD transfer
		const cost = qty * price;

		buyerUSD.locked -= cost;
		sellerUSD.available += cost;

		// Asset transfer
		sellerBase.locked -= qty;
		buyerBase.available += qty;
	}
}

export function releaseBalance(order: OrderRecord) {
	const { userId, side, symbol, qty, filledQty, fills } = order;

	const baseAsset = symbol.split("_")[0]!;
	const usd = ensureAsset(userId, "USD");
	const base = ensureAsset(userId, baseAsset);

	if (side === "BUY") {
		const spent = fills.reduce((t, f) => t + f.price * f.qty, 0);
		const remaining = order.lockedAmount - spent;

		if (remaining < 0) throw new Error("Invalid remaining amount");
		if (usd.locked < remaining) throw new Error("Insufficient Locked Balance");

		usd.locked -= remaining;
		usd.available += remaining;

		return remaining;
	} else {
		const remainingQty = qty - filledQty;

		if (base.locked < remainingQty) {
			throw new Error("Insufficient Locked Balance");
		}

		base.locked -= remainingQty;
		base.available += remainingQty;

		return remainingQty;
	}
}
