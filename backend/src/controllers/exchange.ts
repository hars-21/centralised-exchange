import type { Request, Response } from "express";
import {
	orderBodySchema,
	orderIdParamSchema,
	statusQuerySchema,
	symbolParamSchema,
} from "../types/exchange";
import { deleteOrder, fetchOrders, placeOrder } from "../engine";
import { getUserBalance } from "../balances";
import { getSymbolDepth } from "../orderbook";

function getUserId(req: Request): string {
	if (!req.userId) {
		throw new Error("Missing authenticated user");
	}
	return req.userId;
}

export async function createOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedBody = orderBodySchema.safeParse(req.body);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { side, type, symbol, qty } = parsedBody.data;
	const price = type === "MARKET" ? null : parsedBody.data.price;

	try {
		const engineResponse = placeOrder({
			userId,
			type,
			side,
			symbol,
			price: type === "MARKET" ? null : price,
			qty,
		});

		res.status(200).json(engineResponse);
	} catch (e) {
		res.status(400).json({ error: e });
		return;
	}
}

export async function getOrders(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedBody = statusQuerySchema.safeParse(req.query);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { status } = parsedBody.data;

	try {
		const orders = fetchOrders(userId, status);

		res.status(200).json({ data: orders });
	} catch (e) {
		res.status(401).json({ error: "error fetching orders" });
	}
}

export async function getDepth(req: Request, res: Response) {
	const parsedBody = symbolParamSchema.safeParse(req.params);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { symbol } = parsedBody.data;

	try {
		const engineResponse = getSymbolDepth(symbol);

		res.status(200).json(engineResponse);
	} catch (e) {
		res.status(400).json({ error: e });
		return;
	}
}

export async function getBalance(req: Request, res: Response) {
	const userId = getUserId(req);

	const balance = getUserBalance(userId);

	res.status(200).json(balance);
}

// TODO
export async function getFills(req: Request, res: Response) {
	const symbol = req.params.symbol;

	try {
		const fills = {};

		res.status(200).json({ data: fills });
	} catch (e) {
		res.status(401).json({ error: "error fetching fills" });
	}
}

// TODO
export async function getStocks(req: Request, res: Response) {
	try {
		const stocks = {};

		res.status(200).json({ data: stocks });
	} catch (e) {
		res.status(401).json({ error: "error fetching stocks" });
	}
}

export async function cancelOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedBody = orderIdParamSchema.safeParse(req.params);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { orderId } = parsedBody.data;
	try {
		const order = deleteOrder(orderId, userId);

		res.status(200).json({ ...order });
	} catch (e) {
		res.status(401).json({ error: "invalid orderId" });
	}
}
