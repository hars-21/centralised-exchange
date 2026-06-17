export interface DepthLevel {
	price: number;
	qty: number;
}

export interface Depth {
	symbol: string;
	bids: DepthLevel[];
	asks: DepthLevel[];
}

export interface Balance {
	available: number;
	locked: number;
}

export interface UserBalance {
	[asset: string]: Balance;
}

export interface StreamResponse {
	bids: DepthLevel[];
	asks: DepthLevel[];
	lastUpdateId: number;
}

export type OrderBook = {
	bids: Record<number, number>;
	asks: Record<number, number>;
};
