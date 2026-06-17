import { BALANCES, ORDERBOOK, ORDERS } from "../src/store";

export function resetState() {
	ORDERBOOK.BTC_USD = {
		bids: {},
		asks: {},
	};

	BALANCES["1"] = {
		USD: {
			available: 10000,
			locked: 0,
		},
		BTC: {
			available: 100,
			locked: 0,
		},
	};

	BALANCES["2"] = {
		USD: {
			available: 10000,
			locked: 0,
		},
		BTC: {
			available: 100,
			locked: 0,
		},
	};

	ORDERS.length = 0;
}
