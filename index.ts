import express from "express";
const PORT = 3000;

const app = express();

const BALANCES = {};

const ORDERBOOKs = {};

app.post("/signup", (req, res) => {});

app.post("/signin", (req, res) => {});

app.post("/order", (req, res) => {});

app.get("/order/:orderId", (req, res) => {});
app.delete("/order/:orderId", (req, res) => {});
app.get("/depth/:symbol", (req, res) => {});
app.get("/orders", (req, res) => {});
app.get("/fills", (req, res) => {});

app.get("/balance/usd", (req, res) => {});

app.get("/balance", (req, res) => {});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
