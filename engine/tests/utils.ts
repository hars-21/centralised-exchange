import { BALANCES, ORDERBOOK, ORDERS } from "../src/store";

export function resetState() {
	ORDERBOOK.BTC = {
		bids: {},
		asks: {},
	};

	BALANCES["1"] = {
		INR: {
			available: 10000,
			locked: 0,
		},
		BTC: {
			available: 100,
			locked: 0,
		},
	};

	BALANCES["2"] = {
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
