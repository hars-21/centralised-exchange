import type { Request, Response } from "express";
import { orderBodySchema, orderIdParamSchema, symbolParamSchema } from "../types/exchange";
import { sendToEngine } from "../utils/engineClient";
import { prisma } from "../db";
import { sendValidationError } from "../utils/validation";

export function getUserId(req: Request): string {
	if (!req.userId) {
		throw new Error("Missing authenticated user");
	}
	return req.userId;
}

// Orders
export async function createOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedBody = orderBodySchema.safeParse(req.body);

	if (!parsedBody.success) {
		sendValidationError(res, parsedBody.error);
		return;
	}

	const { side, type, symbol, qty } = parsedBody.data;
	const price = type === "MARKET" ? null : parsedBody.data.price;
	const orderId = crypto.randomUUID();

	const engineResponse = await sendToEngine("create_order", {
		orderId,
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

export async function getOpenOrders(req: Request, res: Response) {
	const userId = getUserId(req);

	const engineResponse = await sendToEngine("get_open_orders", { userId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedParams = orderIdParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { orderId } = parsedParams.data;

	const engineResponse = await sendToEngine("get_order", { userId, orderId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function cancelOrder(req: Request, res: Response) {
	const userId = getUserId(req);
	const parsedParams = orderIdParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { orderId } = parsedParams.data;
	const engineResponse = await sendToEngine("cancel_order", { userId, orderId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

// Markets
export async function getMarkets(_req: Request, res: Response) {
	try {
		const markets = await prisma.market.findMany();

		res.status(200).json({ data: markets });
	} catch (e) {
		res.status(500).json({ error: "error fetching markets" });
	}
}

export async function getTrades(req: Request, res: Response) {
	const parsedParams = symbolParamSchema.safeParse(req.params);
	const { limit = 100 } = req.query;

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { symbol } = parsedParams.data;

	const engineResponse = await sendToEngine("get_trades", { symbol, limit });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getDepth(req: Request, res: Response) {
	const parsedParams = symbolParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { symbol } = parsedParams.data;

	const engineResponse = await sendToEngine("get_depth", { symbol });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

// Candles
export async function getCandles(req: Request, res: Response) {
	const parsedParams = symbolParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { symbol } = parsedParams.data;
	const from = req.query.from ? new Date(Number(req.query.from)) : undefined;
	const to = req.query.to ? new Date(Number(req.query.to)) : undefined;

	const candles = await prisma.candle.findMany({
		where: {
			symbol,
			...(from || to
				? {
						timestamp: {
							...(from ? { gte: from } : {}),
							...(to ? { lte: to } : {}),
						},
					}
				: {}),
		},
		orderBy: { timestamp: "asc" },
		take: 500,
	});

	res.status(200).json({
		data: candles.map((c) => ({
			time: c.timestamp.getTime(),
			open: c.open,
			high: c.high,
			low: c.low,
			close: c.close,
			volume: c.volume,
		})),
	});
}

// Balances
export async function getBalance(req: Request, res: Response) {
	const userId = getUserId(req);

	const engineResponse = await sendToEngine("get_user_balance", { userId });

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}
