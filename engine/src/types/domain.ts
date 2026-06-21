export type Side = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";
export type OrderStatus = "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";

export interface Balance {
	available: number;
	locked: number;
}

export interface UserBalance {
	[asset: string]: Balance;
}

export interface RestingOrder {
	orderId: string;
	userId: string;
	side: Side;
	type: "LIMIT";
	symbol: string;
	price: number;
	qty: number;
	filledQty: number;
	status: OrderStatus;
	fills: Fill[];
	createdAt: number;
}

export interface OrderRecord {
	orderId: string;
	userId: string;
	side: Side;
	type: OrderType;
	symbol: string;
	price: number | null;
	qty: number;
	filledQty: number;
	status: OrderStatus;
	lockedAmount: number;
	fills: Fill[];
	createdAt: number;
}

export interface Fill {
	fillId: string;
	symbol: string;
	price: number;
	qty: number;
	buyOrderId: string;
	sellOrderId: string;
	createdAt: number;
}

export interface PriceLevel {
	totalQty: number;
	orders: RestingOrder[];
}

export interface Market {
	bids: Record<string, PriceLevel>;
	asks: Record<string, PriceLevel>;
}

export interface CreateOrderInput {
	orderId: string;
	userId: string;
	side: Side;
	type: OrderType;
	symbol: string;
	price: number | null;
	qty: number;
}

export interface DepthLevel {
	price: number;
	qty: number;
}

export interface Depth {
	symbol: string;
	bids: DepthLevel[];
	asks: DepthLevel[];
}
