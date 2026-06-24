export interface Candle {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
	symbol: string;
}

export interface Trade {
	event: "trade";
	symbol: string;
	price: number;
	qty: number;
	maker: boolean;
	id: number;
	timestamp: number;
}
