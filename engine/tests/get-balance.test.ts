import { beforeEach, expect, test } from "bun:test";
import { getUserBalance } from "../src/balance";
import { resetState } from "./utils";
import { cancelOrder, placeOrder } from "../src/engine";

beforeEach(() => {
	resetState();
});

test("new user balance", () => {
	const balance = getUserBalance("1");

	expect(balance).toMatchObject({
		INR: {
			available: 10000,
			locked: 0,
		},
		BTC: {
			available: 100,
			locked: 0,
		},
	});
});

test("buyer balance after fill", () => {
	placeOrder({
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});
	placeOrder({
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	const balance = getUserBalance("2");

	expect(balance).toMatchObject({
		INR: {
			available: 9500,
			locked: 0,
		},
		BTC: {
			available: 105,
			locked: 0,
		},
	});
});

test("seller balance after fill", () => {
	placeOrder({
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});
	placeOrder({
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	const balance = getUserBalance("1");

	expect(balance).toMatchObject({
		INR: {
			available: 10500,
			locked: 0,
		},
		BTC: {
			available: 95,
			locked: 0,
		},
	});
});

test("open order should lock balance", () => {
	placeOrder({
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	placeOrder({
		userId: "2",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC",
		price: 200,
		qty: 5,
	});

	const buyerBalance = getUserBalance("1");
	const sellerBalance = getUserBalance("2");

	expect(buyerBalance).toMatchObject({
		INR: {
			available: 9500,
			locked: 500,
		},
	});

	expect(sellerBalance).toMatchObject({
		BTC: {
			available: 95,
			locked: 5,
		},
	});
});

test("cancelled order should unlock balance", () => {
	const order = placeOrder({
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	expect(getUserBalance("1")).toMatchObject({
		INR: {
			available: 9500,
			locked: 500,
		},
	});

	cancelOrder("1", order.orderId);

	expect(getUserBalance("1")).toMatchObject({
		INR: {
			available: 10000,
			locked: 0,
		},
	});
});
