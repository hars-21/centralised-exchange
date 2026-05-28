import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "./db";
import jwt from "jsonwebtoken";
import "dotenv";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Env variables ---
const SECRET = process.env.JWT_SECRET || "";

// --- Types ---
type Balance = {
	available: number;
	locked: number;
};

type UserBalance = {
	[asset: string]: Balance;
};

type Order = {
	userId: string;
	qty: number;
	filledQty: number;
	orderId: string;
	createdAt: number;
};

type PriceLevel = {
	totalQty: number;
	orders: Order[];
};

type Side = Record<string, PriceLevel>;

type Market = {
	bids: Side;
	asks: Side;
};

type OrderBook = Record<string, Market>;

interface TokenPayload {
	id: string;
}

type Status = "OPEN" | "FILLED" | "CANCELLED";
type UserId = keyof typeof BALANCES;
type Asset = "AXIS" | "HDFC" | "TATA";

const ReceivedOrder = z.object({
	userId: z.string(),
	side: z.enum(["BUY", "SELL"]),
	type: z.enum(["LIMIT", "MARKET"]),
	symbol: z.enum(["AXIS", "HDFC", "TATA"]),
	price: z.number(),
	qty: z.number(),
});
type ReceivedOrder = z.infer<typeof ReceivedOrder>;

// --- In-memory state ---
const BALANCES: Record<string, UserBalance> = {}; // { userId: { INR: {available, locked}, AXIS: {available, locked}, ... } }
const ORDERBOOK: OrderBook = {
	AXIS: {
		bids: {
			// 	299: {
			// 		totalQty: 10,
			// 		orders: [
			// 			{
			// 				userId: "1",
			// 				qty: 10,
			// 				filledQty: 5,
			// 				orderId: "10",
			// 				createdAt: 1,
			// 			},
			// 		],
			// 	},
		},
		asks: {
			// 	300: {
			// 		totalQty: 10,
			// 		orders: [
			// 			{
			// 				userId: "1",
			// 				qty: 20,
			// 				filledQty: 3,
			// 				orderId: "10",
			// 				createdAt: 2,
			// 			},
			// 		],
			// 	},
		},
	},
	HDFC: { bids: {}, asks: {} },
	TATA: { bids: {}, asks: {} },
};

// --- Auth ---
app.post("/signup", async (req, res) => {
	// const { username, password } = req.body;
	// 1. check username not taken
	// 2. hash password (bcrypt/argon2)
	// 3. push to USERS
	// 4. init BALANCES[userId] with INR: { available: 0, locked: 0 }

	const { username, password } = req.body;

	try {
		const existingUser = await prisma.user.findFirst({
			where: { username },
		});

		if (existingUser) {
			res.status(401).json({ error: "username already taken" });
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
			},
		});

		const token = jwt.sign(newUser, SECRET, { expiresIn: "7d" });
		BALANCES[newUser.id] = { INR: { available: 0, locked: 0 } };

		res.status(201).json({ token, userId: newUser.id, username: newUser.username });
	} catch (e) {
		res.status(409).json({ error: "username already exists" });
	}
});

app.post("/login", async (req, res) => {
	// 1. find user by username
	// 2. compare hashed password
	// 3. return JWT / session token

	const { username, password } = req.body;

	try {
		const existingUser = await prisma.user.findFirst({
			where: {
				username,
			},
		});

		if (!existingUser) {
			res.status(401).json({ error: "Invalid username or password" });
			return;
		}

		let match = await bcrypt.compare(password, existingUser.password);
		if (!match) {
			res.status(401).json({ error: "Invalid username or password" });
			return;
		}

		const token = jwt.sign(existingUser, SECRET, { expiresIn: "7d" });

		res.status(201).json({ token, userId: existingUser.id, username: existingUser.username });
	} catch (e) {
		res.status(409).json({ error: "username does not exist" });
	}
});

// --- Auth middleware
app.use((req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.startsWith("Bearer") ? authHeader.slice(7) : undefined;

	if (!token) {
		res.status(401).json({ error: "Missing auth token" });
		return;
	}

	try {
		const payload = jwt.verify(token, SECRET) as TokenPayload;
		req.userId = payload.id;
		next();
	} catch (e) {
		res.status(401).json({ error: "Invalid auth token" });
	}
});

// --- Orders ---
app.post("/order", (req, res) => {
	// body: { userId, side: "BUY"|"SELL", type: "LIMIT"|"MARKET", symbol, price?, qty }
	// 1. validate input + stock exists
	// 2. check + lock balance (INR for BUY, stock for SELL)
	// 3. run matching engine against opposite side of ORDERBOOK
	// 4. write fills to FILLS, update filledQty + status on ORDERS
	// 5. if leftover qty and LIMIT, rest on book; if MARKET, cancel remainder
	// 6. settle balances on each fill (move locked -> other asset's available)

	const parsedOrder = ReceivedOrder.safeParse(req.body);

	if (!parsedOrder.success) {
		res.status(401).json({ error: parsedOrder.error });
		return;
	}

	const { side, type, symbol, price, qty } = parsedOrder.data;
	const userId = req.userId;

	// Check balance and lock it
	if (!BALANCES[userId]) {
		BALANCES[userId] = { INR: { available: 0, locked: 0 }, [symbol]: { available: 0, locked: 0 } };
	}

	if (side === "BUY") {
		let inrBalance = BALANCES[userId].INR || { available: 0, locked: 0 };
		let totalAmount = price * qty;

		if (inrBalance.available >= totalAmount) {
			inrBalance.available -= totalAmount;
			inrBalance.locked += totalAmount;

			BALANCES[userId].INR = inrBalance;
		} else {
			res.status(401).json({ error: "Insufficient Balance" });
			return;
		}
	} else {
		let stockBalance = BALANCES[userId][symbol] || { available: 0, locked: 0 };
		if (stockBalance.available >= qty) {
			stockBalance.available -= qty;
			stockBalance.locked += qty;

			BALANCES[userId][symbol] = stockBalance;
		} else {
			res.status(401).json({ error: "Insufficient Balance" });
			return;
		}
	}

	let result = placeOrder(parsedOrder.data);

	res.status(200).json({ success: "ok" });
});

// app.delete("/order/:orderId", async (req, res) => {
// 	// 1. find order, check ownership
// 	// 2. remove from ORDERBOOK price level
// 	// 3. unlock remaining reserved balance
// 	// 4. mark status = CANCELLED

// 	const orderId = req.params.orderId;

// 	try {
// 		const order = await prisma.order.findFirst({
// 			where: {
// 				id: orderId,
// 				userId: req.userId,
// 			},
// 		});

// 		if (!order) {
// 			res.status(401).json({ error: "unauthorized" });
// 			return;
// 		}

// 		const asset = order.market as Asset;
// 		const side = order.side;
// 		const price = order.price;

// 		let orders = ORDERBOOK[asset][side][price].orders;

// 		ORDERBOOK[asset][side][price].orders = orders.filter((x: any) => {
// 			return x.orderId !== orderId;
// 		});
// 		ORDERBOOK[asset][side][price].totalQty -= orders[orderId].qty;

// 		if (ORDERBOOK[asset][side][price].orders.length === 0) {
// 			delete ORDERBOOK[asset][side][price];
// 		}

// 		const userId = req.userId! as UserId;
// 		const qty = order.qty;

// 		if (side === "bids") {
// 			BALANCES[userId].INR.locked -= qty * price;
// 			BALANCES[userId].INR.available += qty * price;
// 		} else {
// 			BALANCES[userId][asset].locked -= qty;
// 			BALANCES[userId][asset].available += qty;
// 		}

// 		await prisma.order.update({
// 			where: {
// 				id: orderId,
// 			},
// 			data: {
// 				status: "CANCELLED",
// 			},
// 		});

// 		res.status(200).json({ message: "order successfully deleted" });
// 	} catch (e) {
// 		res.status(401).json({ error: "invalid orderId" });
// 	}
// });

app.get("/orders", async (req, res) => {
	// query: ?status=OPEN  (or all)
	// return current user's orders

	const { status } = req.query;

	try {
		const orders = await prisma.order.findMany({
			where: {
				userId: req.userId,
				status: status as Status,
			},
		});

		res.status(200).json({ data: ORDERBOOK });
	} catch (e) {
		res.status(401).json({ error: "error fetching orders" });
	}
});

// // --- Market data ---
app.get("/orderbook/:symbol", (req, res) => {
	// return aggregated depth — totalQty per price level for bids and asks
	// (don't expose individual userIds to other users)

	const symbol = req.params.symbol as Asset;

	const depth = ORDERBOOK[symbol];

	res.status(200).json({ data: depth });
});

app.get("/fills/:symbol", async (req, res) => {
	// recent trades for this stock — the "tape"

	const symbol = req.params.symbol;

	try {
		const fills = await prisma.fill.findMany({
			where: {
				userId: req.userId,
				asset: symbol,
			},
		});

		res.status(200).json({ data: fills });
	} catch (e) {
		res.status(401).json({ error: "error fetching fills" });
	}
});

app.get("/stocks", async (req, res) => {
	try {
		const stocks = await prisma.stock.findMany();

		res.status(200).json({ data: stocks });
	} catch (e) {
		res.status(401).json({ error: "error fetching stocks" });
	}
});

// --- User data ---
app.get("/balance", (req, res) => {
	// return BALANCES[userId] for the authed user

	const userId = req.userId;

	if (!userId) {
		res.status(401).json({ error: "unauthorised" });
		return;
	}

	const balance = BALANCES[userId];
	res.status(201).json({ data: balance });
});

app.post("/balance", (req, res) => {
	// return BALANCES[userId] for the authed user

	const { amount } = req.body;
	const userId = req.userId;

	if (!userId) {
		res.status(401).json({ error: "unauthorised" });
		return;
	}

	if (!BALANCES[userId]) {
		BALANCES[userId] = {
			INR: {
				available: 0,
				locked: 0,
			},
			AXIS: {
				available: 0,
				locked: 0,
			},
		};
	}

	BALANCES[userId].INR!.available += amount;
	BALANCES[userId].AXIS!.available += 10;
	const balance = BALANCES[userId];

	res.status(201).json({ data: balance });
});

app.listen(3000, () => console.log("Server running on :3000"));

// Matching Engine
function placeOrder(order: ReceivedOrder) {
	if (order.side === "BUY") {
		let remainingQty = matchBuyOrder(order);
	} else {
		let remainingQty = matchSellOrder(order);
	}
}

function getBestBid(bids: Side) {
	const bestBid = Math.max(...Object.keys(bids).map(Number));
	return bestBid;
}

function getBestAsk(asks: Side) {
	const bestAsk = Math.min(...Object.keys(asks).map(Number));
	return bestAsk;
}

function matchBuyOrder(order: ReceivedOrder): number {
	let remainingQty = order.qty;
	const asks = ORDERBOOK[order.symbol]?.asks || {};

	if (!BALANCES[order.userId]![order.symbol]) {
		BALANCES[order.userId]![order.symbol] = {
			available: 0,
			locked: 0,
		};
	}

	let inrBalance = BALANCES[order.userId]!.INR;
	let stockBalance = BALANCES[order.userId]![order.symbol]!;

	if (!inrBalance) {
		throw Error("Invalid INR balance");
	}

	while (remainingQty > 0) {
		const bestAskPrice = getBestAsk(asks);
		if (!bestAskPrice) break;

		if (order.type === "LIMIT" && bestAskPrice > order.price) {
			break;
		}

		const priceLevel = ORDERBOOK[order.symbol]?.asks[bestAskPrice];
		if (!priceLevel) break;

		while (remainingQty > 0 && priceLevel.orders.length > 0) {
			const restingOrder = priceLevel.orders[0]!;

			let sellerINRBalance = BALANCES[restingOrder.userId]!.INR!;
			let sellerStockBalance = BALANCES[restingOrder.userId]![order.symbol]!;

			const availableQty = restingOrder.qty - restingOrder.filledQty;
			if (inrBalance.locked < bestAskPrice * availableQty) {
				throw Error("Insufficient locked funds");
			}

			if (remainingQty >= availableQty) {
				remainingQty -= availableQty;

				restingOrder.filledQty += availableQty;
				inrBalance.locked -= bestAskPrice * availableQty;
				stockBalance.available += availableQty;

				sellerStockBalance.locked -= availableQty;
				sellerINRBalance.available += bestAskPrice * availableQty;
				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
			} else {
				restingOrder.filledQty += remainingQty;
				priceLevel.totalQty -= remainingQty;
				inrBalance.locked -= bestAskPrice * remainingQty;
				stockBalance.available += remainingQty;
				sellerStockBalance.locked -= remainingQty;
				sellerINRBalance.available += bestAskPrice * remainingQty;
				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete asks[bestAskPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook({
			...order,
			qty: remainingQty,
		});
	}

	return remainingQty;
}

function matchSellOrder(order: ReceivedOrder): number {
	let remainingQty = order.qty;
	const bids = ORDERBOOK[order.symbol]?.bids || {};

	if (!BALANCES[order.userId]![order.symbol]) {
		BALANCES[order.userId]![order.symbol] = {
			available: 0,
			locked: 0,
		};
	}

	let stockBalance = BALANCES[order.userId]![order.symbol]!;
	let inrBalance = BALANCES[order.userId]!.INR!;

	if (!stockBalance) {
		throw Error("Invalid stock balance");
	}

	while (remainingQty > 0) {
		const bestBidPrice = getBestBid(bids);
		if (!bestBidPrice) break;

		if (order.type === "LIMIT" && bestBidPrice < order.price) {
			break;
		}

		const priceLevel = ORDERBOOK[order.symbol]?.bids[bestBidPrice];
		if (!priceLevel) break;

		while (remainingQty > 0 && priceLevel.orders.length > 0) {
			const restingOrder = priceLevel.orders[0]!;

			let buyerINRBalance = BALANCES[restingOrder.userId]!.INR!;
			let buyerStockBalance = BALANCES[restingOrder.userId]![order.symbol]!;

			const availableQty = restingOrder.qty - restingOrder.filledQty;

			if (stockBalance.locked < availableQty) {
				throw Error("Insufficient locked stocks");
			}

			if (remainingQty >= availableQty) {
				remainingQty -= availableQty;

				restingOrder.filledQty += availableQty;

				stockBalance.locked -= availableQty;
				inrBalance.available += bestBidPrice * availableQty;

				buyerINRBalance.locked -= bestBidPrice * availableQty;

				if (!buyerStockBalance) {
					BALANCES[restingOrder.userId]![order.symbol] = {
						available: 0,
						locked: 0,
					};

					buyerStockBalance = BALANCES[restingOrder.userId]![order.symbol]!;
				}

				buyerStockBalance.available += availableQty;

				priceLevel.totalQty -= availableQty;
				priceLevel.orders.shift();
			} else {
				restingOrder.filledQty += remainingQty;

				stockBalance.locked -= remainingQty;
				inrBalance.available += bestBidPrice * remainingQty;

				buyerINRBalance.locked -= bestBidPrice * remainingQty;

				if (!buyerStockBalance) {
					BALANCES[restingOrder.userId]![order.symbol] = {
						available: 0,
						locked: 0,
					};

					buyerStockBalance = BALANCES[restingOrder.userId]![order.symbol]!;
				}

				buyerStockBalance.available += remainingQty;

				priceLevel.totalQty -= remainingQty;

				remainingQty = 0;
			}
		}

		if (priceLevel.orders.length === 0) {
			delete bids[bestBidPrice];
		}
	}

	if (remainingQty > 0 && order.type === "LIMIT") {
		addOrderToBook({
			...order,
			qty: remainingQty,
		});
	}

	return remainingQty;
}

function addOrderToBook(order: ReceivedOrder) {
	if (order.type === "MARKET") {
		return;
	}

	if (order.qty <= 0) {
		throw new Error("Invalid qty");
	}

	if (order.price <= 0) {
		throw new Error("Invalid price");
	}

	const orderSide = order.side === "BUY" ? "bids" : "asks";
	const price = String(order.price);
	let priceLevel = ORDERBOOK[order.symbol]![orderSide][price];

	const newOrder = {
		userId: order.userId,
		qty: order.qty,
		filledQty: 0,
		orderId: uuidv4(),
		createdAt: Date.now(),
	};

	if (priceLevel) {
		priceLevel.orders.push(newOrder);
		priceLevel.totalQty += order.qty;
	} else {
		ORDERBOOK[order.symbol]![orderSide][price] = {
			totalQty: order.qty,
			orders: [newOrder],
		};
	}
}
