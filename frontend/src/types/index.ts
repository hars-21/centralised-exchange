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
