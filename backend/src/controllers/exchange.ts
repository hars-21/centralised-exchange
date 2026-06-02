import type { Request, Response } from "express";
import { orderBodySchema, orderIdParamSchema, symbolParamSchema } from "../types/exchange";
import { sendToEngine } from "../utils/engineClient";

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

	const engineResponse = await sendToEngine("create_order", {
		userId,
		type,
		side,
		symbol,
		price: type === "MARKET" ? null : price,
		qty,
	});

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedBody = orderIdParamSchema.safeParse(req.params);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { orderId } = parsedBody.data;

	const engineResponse = await sendToEngine("get_order", { userId, orderId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getDepth(req: Request, res: Response) {
	const parsedBody = symbolParamSchema.safeParse(req.params);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { symbol } = parsedBody.data;

	const engineResponse = await sendToEngine("get_depth", { symbol });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getBalance(req: Request, res: Response) {
	const userId = getUserId(req);

	const engineResponse = await sendToEngine("get_user_balance", { userId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
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
	const engineResponse = await sendToEngine("cancel_order", { userId, orderId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}
