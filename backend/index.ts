import express from "express";

const app = express();
app.use(express.json());

// --- In-memory state ---
const USERS = [];
const STOCKS = [
	{ id: 1, title: "AXIS BANK", symbol: "AXIS" },
	{ id: 2, title: "HDFC BANK", symbol: "HDFC" },
	{ id: 3, title: "TATA Steel", symbol: "TATA" },
];
const ORDERS = [];
const FILLS = [];
const BALANCES = {}; // { userId: { INR: {available, locked}, AXIS: {available, locked}, ... } }
const ORDERBOOK = {
	AXIS: { bids: {}, asks: {} },
	HDFC: { bids: {}, asks: {} },
	TATA: { bids: {}, asks: {} },
};

// --- Auth ---
app.post("/signup", (req, res) => {
	// const { username, password } = req.body;
	// 1. check username not taken
	// 2. hash password (bcrypt/argon2)
	// 3. push to USERS
	// 4. init BALANCES[userId] with INR: { available: 0, locked: 0 }
});

app.post("/login", (req, res) => {
	// 1. find user by username
	// 2. compare hashed password
	// 3. return JWT / session token
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
});

app.delete("/order/:orderId", (req, res) => {
	// 1. find order, check ownership
	// 2. remove from ORDERBOOK price level
	// 3. unlock remaining reserved balance
	// 4. mark status = CANCELLED
});

app.get("/orders", (req, res) => {
	// query: ?status=OPEN  (or all)
	// return current user's orders
});

// --- Market data ---
app.get("/orderbook/:symbol", (req, res) => {
	// return aggregated depth — totalQty per price level for bids and asks
	// (don't expose individual userIds to other users)
});

app.get("/fills/:symbol", (req, res) => {
	// recent trades for this stock — the "tape"
});

app.get("/stocks", (req, res) => {
	res.json(STOCKS);
});

// --- User data ---
app.get("/balance", (req, res) => {
	// return BALANCES[userId] for the authed user
});

app.listen(3000, () => console.log("CEX running on :3000"));
