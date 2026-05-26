import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "./db";
import jwt from "jsonwebtoken";
import "dotenv";

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
	userId: number;
	qty: number;
	filledQty: number;
	orderId: number;
	createdAt: string;
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

// --- In-memory state ---
const BALANCES: Record<string, UserBalance> = {}; // { userId: { INR: {available, locked}, AXIS: {available, locked}, ... } }
const ORDERBOOK: OrderBook = {
	AXIS: {
		bids: {
			299: {
				totalQty: 10,
				orders: [
					{
						userId: 1,
						qty: 10,
						filledQty: 5,
						orderId: 10,
						createdAt: "1 May 2026 3:30 PM",
					},
				],
			},
		},
		asks: {
			300: {
				totalQty: 10,
				orders: [
					{
						userId: 1,
						qty: 20,
						filledQty: 3,
						orderId: 10,
						createdAt: "1 May 2026 3:30 PM",
					},
				],
			},
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
	// const { userId, side, type, symbol, price, qty } = req.body;
	// if (!(side in ["BUY", "SELL"])) {
	// 	res.status(401).json({ error: "Invalid side" });
	// 	return;
	// }
	// if (!(type in ["LIMIT", "MARKET"])) {
	// 	res.status(401).json({ error: "Invalid type" });
	// 	return;
	// }
	// if (!(symbol in ["AXIS", "HDFC", "TATA"])) {
	// 	res.status(401).json({ error: "Invalid stock" });
	// }
	// if (!userId) {
	// 	res.status(401).json({ error: "unauthorised" });
	// 	return;
	// }
	// // Check balance
	// let asset = side === "BUY" ? "INR" : symbol;
	// let stockBalance = BALANCES[userId]?[asset]?.available || 0;
	// let totalAmount = price * qty;
	// if (stockBalance >= totalAmount) {
	// 	BALANCES[userId][asset]?.available -= totalAmount;
	// 	BALANCES[userId][asset]?.locked += totalAmount;
	// } else {
	// 	res.status(401).json({ error: "Insufficient Balance" });
	// }
	// if (ORDERBOOK[symbol][side][price]) {
	// 	if (ORDERBOOK[symbol][side][price].totalQty > qty) {
	// 		ORDERBOOK[symbol][side][price].totalQty -= qty;
	// 		ORDERBOOK[symbol][side][price].orders = ORDERBOOK[symbol][side][price].orders.filter(
	// 			(order) => {
	// 				order.qty - order.filledQty;
	// 			},
	// 		);
	// 	}
	// }
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

		res.status(200).json({ data: orders });
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

app.listen(3000, () => console.log("CEX running on :3000"));
