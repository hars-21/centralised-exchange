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

export interface OrderRecord {
	orderId: string;
	userId: string;
	side: "BUY" | "SELL";
	type: "LIMIT" | "MARKET";
	symbol: string;
	price: number | null;
	qty: number;
	filledQty: number;
	status: string;
	createdAt: number;
}

export interface Trade {
	id: number;
	price: number;
	qty: number;
	maker: boolean;
	timestamp: number;
}

export interface Market {
	id: string;
	symbol: string;
	name: string;
}

export interface Candle {
	event?: string;
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	symbol: string;
}
