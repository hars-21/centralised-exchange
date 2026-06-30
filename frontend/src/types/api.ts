import type { UserBalance } from ".";

export type UserData = {
	userId: string;
	email: string;
	username: string;
	balance: UserBalance;
};

export type OrderResult = {
	orderId: string;
	status: string;
	filledQty: number;
	averagePrice: number | null;
	fills: Fill[];
};

export type Fill = {
	fillId: string;
	symbol: string;
	price: number;
	qty: number;
	buyOrderId: string;
	sellOrderId: string;
	isBuyerMaker: boolean;
	createdAt: number;
};

export type DepthSnapshot = {
	symbol: string;
	bids: { price: number; qty: number }[];
	asks: { price: number; qty: number }[];
	lastUpdateId: number;
	timestamp: number;
};

export type CancelResult = {
	orderId: string;
	status: string;
	qty: number;
	filledQty: number;
	releasedFunds: number;
};
