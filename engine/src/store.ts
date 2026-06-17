import type { Market, OrderRecord, UserBalance } from "./types/store";

// --- In-memory state ---
/*
	BALANCES = {
		user1: {
			USD: {
				available: 0,
				locked: 0,
			},
			SOL_USD: {
				available: 0,
				locked: 0,
			},
		},
		user2: {
			USD: {
				available: 0,
				locked: 0,
			},
			SOL_USD: {
				available: 0,
				locked: 0,
			},
		},
	};
*/
export const BALANCES: Record<string, UserBalance> = {};

/*
	ORDERBOOK = {
		SOL_USD: {
			bids: {
				299: {
					totalQty: 10,
					orders: [
						{
							userId: "1",
							qty: 10,
							filledQty: 5,
							orderId: "10",
							createdAt: 1780151880075,
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
							createdAt: 1780151880075,
						},
					],
				},
			},
		},
	};
*/
export const ORDERBOOK: Record<string, Market> = {
	BTC_USD: { bids: {}, asks: {} },
	SOL_USD: { bids: {}, asks: {} },
	ETH_USD: { bids: {}, asks: {} },
};

/*
	ORDERS = [
		{
			userId: "796f7997-a68b-4631-bc1b-2b391a4d44c2",
			type: "LIMIT",
			side: "BUY",
			symbol: "SOL_USD",
			price: 50,
			qty: 2,
			orderId: "81dbd809-d762-4d34-9a86-2fdd635f917a",
			filledQty: 0,
			status: "OPEN",
			createdAt: 1780151880075,
		},
	];
*/
export const ORDERS: OrderRecord[] = [];
