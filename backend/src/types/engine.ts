interface Balance {
	available: number;
	locked: number;
}

export interface UserBalance {
	[asset: string]: Balance;
}

export interface RestingOrder {
	userId: string;
	qty: number;
	filledQty: number;
	orderId: string;
	createdAt: number;
}

interface PriceLevel {
	totalQty: number;
	orders: RestingOrder[];
}

export interface Market {
	bids: Record<string, PriceLevel>;
	asks: Record<string, PriceLevel>;
}

export interface CreateOrderInput {
	userId: string;
	side: "BUY" | "SELL";
	type: "LIMIT" | "MARKET";
	symbol: string;
	price: number | null;
	qty: number;
}

export interface OrderRecord {
	orderId: string;
	userId: string;
	side: "BUY" | "SELL";
	type: "LIMIT" | "MARKET";
	symbol: string;
	price: number | null;
	qty: number;
	filledQty: number;
	status: Status;
	createdAt: number;
}

export interface Trade {
	buyOrderId: string;
	sellOrderId: string;
	qty: number;
	price: number;
}

export type Status = "PENDING" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";

export type EngineCommandType =
	| "place_order"
	| "get_depth"
	| "get_user_balance"
	| "get_order"
	| "cancel_order";

export interface EngineRequest {
	correlationId: string;
	responseQueue: string;
	type: EngineCommandType;
	payload: Record<string, unknown>;
}

export interface EngineResponse {
	correlationId: string;
	success: boolean;
	data?: unknown;
	error?: string;
}
