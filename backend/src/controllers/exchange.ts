import type { Request, Response } from "express";
import { orderBodySchema, orderIdParamSchema, symbolParamSchema } from "../types/exchange";
import { sendToEngine } from "../utils/engineClient";
import { prisma } from "../db";
import { sendValidationError } from "../utils/validation";

function getUserId(req: Request): string {
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
		res.status(401).json({ error: "error fetching markets" });
	}
}

export async function getTrades(req: Request, res: Response) {
	const parsedParams = symbolParamSchema.safeParse(req.params);

	if (!parsedParams.success) {
		sendValidationError(res, parsedParams.error);
		return;
	}

	const { symbol } = parsedParams.data;

	try {
		const trades = await prisma.fill.findMany({
			where: {
				symbol,
			},
		});

		res.status(200).json({ data: trades });
	} catch (e) {
		res.status(401).json({ error: "error fetching trades" });
	}
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
