import { beforeEach, expect, test } from "bun:test";
import { cancelOrder, placeOrder } from "../src/engine";
import { getDepth } from "../src/orderbook";
import { resetState } from "./utils";

beforeEach(() => {
	resetState();
});

test("cancel open limit order", () => {
	const order = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 10,
	});

	expect(cancelOrder("1", order.orderId)).toMatchObject({
		orderId: order.orderId,
		qty: 10,
		filledQty: 0,
		status: "CANCELLED",
		releasedFunds: 1000,
	});

	expect(getDepth("BTC_USD")).toMatchObject({
		symbol: "BTC_USD",
		bids: [],
		asks: [],
	});
});

test("cancel partially filled order", () => {
	const order = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 10,
	});

	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 4,
	});

	expect(cancelOrder("1", order.orderId)).toMatchObject({
		orderId: order.orderId,
		qty: 10,
		filledQty: 4,
		status: "CANCELLED",
		releasedFunds: 600,
	});

	expect(getDepth("BTC_USD")).toMatchObject({
		symbol: "BTC_USD",
		bids: [],
		asks: [],
	});
});

test("cancel filled order", () => {
	const order = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	expect(() => {
		cancelOrder("1", order.orderId);
	}).toThrow("Filled orders cannot be cancelled");
});

test("cancel already cancelled order", () => {
	const order = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	cancelOrder("1", order.orderId);

	const result = cancelOrder("1", order.orderId);
	expect(result).toMatchObject({ message: "Order already cancelled" });
});

test("cancel unknown order", () => {
	expect(() => {
		cancelOrder("1", "invalid-order-id");
	}).toThrow("Order not Found");
});

test("user tries to cancel another user's order", () => {
	const order = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	expect(() => {
		cancelOrder("2", order.orderId);
	}).toThrow("Order not Found");
});
