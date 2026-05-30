import type { Market, UserBalance } from "./types/engine";

// --- In-memory state ---
/*
	BALANCES = {
		user1: {
			INR: {
				available: 0,
				locked: 0,
			},
			SOL: {
				available: 0,
				locked: 0,
			},
		},
		user2: {
			INR: {
				available: 0,
				locked: 0,
			},
			SOL: {
				available: 0,
				locked: 0,
			},
		},
	};
*/
export const BALANCES: Record<string, UserBalance> = {};
/*
	ORDERBOOK = {
		SOL: {
			bids: {
				299: {
					totalQty: 10,
					orders: [
						{
							userId: "1",
							qty: 10,
							filledQty: 5,
							orderId: "10",
							createdAt: "29-05-26",
						},
					],
				},
			},
			asks: {
				300: {
					totalQty: 10,
					orders: [
						{
							userId: "1",
							qty: 20,
							filledQty: 3,
							orderId: "10",
							createdAt: "29-05-26",
						},
					],
				},
			},
		},
	};
*/
export const ORDERBOOK: Record<string, Market> = {
	AXIS: { bids: {}, asks: {} },
	HDFC: { bids: {}, asks: {} },
	TATA: { bids: {}, asks: {} },
};
