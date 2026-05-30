import type { Request, Response } from "express";
import { prisma } from "../db";
import { orderBodySchema, symbolParamSchema } from "../types/exchange";
import { placeOrder } from "../engine";
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

	const engineResponse = placeOrder({
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

// export async function getOrders(req: Request, res: Response) {
// 	const { status } = req.query;

// 	try {
// 		const orders = await prisma.order.findMany({
// 			where: {
// 				userId: getUserId(req),
// 				status: status as Status,
// 			},
// 		});

// 		res.status(200).json({ data: ORDERBOOK });
// 	} catch (e) {
// 		res.status(401).json({ error: "error fetching orders" });
// 	}
// }

export async function getDepth(req: Request, res: Response) {
	// return aggregated depth — totalQty per price level for bids and asks
	// (don't expose individual userIds to other users)

	const parsedBody = symbolParamSchema.safeParse(req.params);

	if (!parsedBody.success) {
		res.status(401).json({ error: parsedBody.error });
		return;
	}

	const { symbol } = parsedBody.data;

	const engineResponse = getSymbolDepth(symbol);

	if (!engineResponse.success) {
		res.status(400).json({ error: engineResponse.error });
		return;
	}

	res.status(200).json(engineResponse.data);
}

export async function getBalance(req: Request, res: Response) {
	const userId = getUserId(req);

	const balance = getUserBalance(userId);

	res.status(200).json(balance);
}

// export async function getFills(req: Request, res: Response) {
// 	// recent trades for this stock — the "tape"

// 	const symbol = req.params.symbol;

// 	try {
// 		const fills = await prisma.fill.findMany({
// 			where: {
// 				userId: getUserId(req),
// 				asset: symbol,
// 			},
// 		});

// 		res.status(200).json({ data: fills });
// 	} catch (e) {
// 		res.status(401).json({ error: "error fetching fills" });
// 	}
// }

// export async function getStocks(req: Request, res: Response) {
// 	try {
// 		const stocks = await prisma.stock.findMany();

// 		res.status(200).json({ data: stocks });
// 	} catch (e) {
// 		res.status(401).json({ error: "error fetching stocks" });
// 	}
// }

// export async function cancelOrder(req: Request, res: Response) {
// 	// 	// 1. find order, check ownership
// 	// 	// 2. remove from ORDERBOOK price level
// 	// 	// 3. unlock remaining reserved balance
// 	// 	// 4. mark status = CANCELLED
// 	// 	const orderId = req.params.orderId;
// 	// 	try {
// 	// 		const order = await prisma.order.findFirst({
// 	// 			where: {
// 	// 				id: orderId,
// 	// 				userId: getUserId(req),
// 	// 			},
// 	// 		});
// 	// 		if (!order) {
// 	// 			res.status(401).json({ error: "unauthorized" });
// 	// 			return;
// 	// 		}
// 	// 		const asset = order.market as Asset;
// 	// 		const side = order.side;
// 	// 		const price = order.price;
// 	// 		let orders = ORDERBOOK[asset][side][price].orders;
// 	// 		ORDERBOOK[asset][side][price].orders = orders.filter((x: any) => {
// 	// 			return x.orderId !== orderId;
// 	// 		});
// 	// 		ORDERBOOK[asset][side][price].totalQty -= orders[orderId].qty;
// 	// 		if (ORDERBOOK[asset][side][price].orders.length === 0) {
// 	// 			delete ORDERBOOK[asset][side][price];
// 	// 		}
// 	// 		const userId = getUserId(req)! as UserId;
// 	// 		const qty = order.qty;
// 	// 		if (side === "bids") {
// 	// 			BALANCES[userId].INR.locked -= qty * price;
// 	// 			BALANCES[userId].INR.available += qty * price;
// 	// 		} else {
// 	// 			BALANCES[userId][asset].locked -= qty;
// 	// 			BALANCES[userId][asset].available += qty;
// 	// 		}
// 	// 		await prisma.order.update({
// 	// 			where: {
// 	// 				id: orderId,
// 	// 			},
// 	// 			data: {
// 	// 				status: "CANCELLED",
// 	// 			},
// 	// 		});
// 	// 		res.status(200).json({ message: "order successfully deleted" });
// 	// 	} catch (e) {
// 	// 		res.status(401).json({ error: "invalid orderId" });
// 	// 	}
// }
