import { beforeEach, expect, test } from "bun:test";
import { resetState } from "./utils";
import { getOrder, placeOrder } from "../src/engine";

beforeEach(() => {
	resetState();
});

test("open order", () => {
	const order = placeOrder({
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	expect(getOrder("1", order.orderId)).toMatchObject({
		orderId: order.orderId,
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
		filledQty: 0,
		status: "OPEN",
		fills: [],
	});
});

test("partially filled order", () => {
	const order = placeOrder({
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
		price: 100,
		qty: 2,
	});

	expect(getOrder("1", order.orderId)).toMatchObject({
		orderId: order.orderId,
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
		filledQty: 2,
		status: "PARTIALLY_FILLED",
	});
});

test("filled order", () => {
	const order = placeOrder({
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
		price: 100,
		qty: 5,
	});

	expect(getOrder("1", order.orderId)).toMatchObject({
		orderId: order.orderId,
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
		filledQty: 5,
		status: "FILLED",
	});
});

test("unknown order", () => {
	expect(() => {
		getOrder("1", "invalid-order-id");
	}).toThrow("Order not Found");
});

test("user tries to read another user's order", () => {
	const order = placeOrder({
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});

	expect(() => {
		getOrder("2", order.orderId);
	}).toThrow("Order not Found");
});
