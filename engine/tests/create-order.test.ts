import { beforeEach, expect, test } from "bun:test";
import { placeOrder } from "../src/engine";
import { resetState } from "./utils";
import { getDepth } from "../src/orderbook";

beforeEach(() => {
	resetState();
});

test("limit buy order does not match", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 200,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const depth = getDepth("BTC_USD");

	expect(result).toMatchObject({
		status: "OPEN",
		filledQty: 0,
		averagePrice: null,
		fills: [],
	});

	expect(depth).toMatchObject({
		symbol: "BTC_USD",
		bids: [
			{
				price: 100,
				qty: 5,
			},
		],
		asks: [
			{
				price: 200,
				qty: 5,
			},
		],
	});
});

test("limit buy order matches best ask", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 5,
		averagePrice: 100,
	});
});

test("limit buy order has better price than best ask", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 200,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 5,
		averagePrice: 100,
	});
});

test("limit sell order does not match", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 200,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "OPEN",
		filledQty: 0,
		averagePrice: null,
		fills: [],
	});
});

test("limit sell order has better price than best bid", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 200,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 5,
		averagePrice: 200,
	});
});

test("partial fill for limit order", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 3,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 10,
	});

	const depth = getDepth("BTC_USD");

	expect(result).toMatchObject({
		status: "PARTIALLY_FILLED",
		filledQty: 3,
		averagePrice: 100,
	});

	expect(depth).toMatchObject({
		symbol: "BTC_USD",
		bids: [
			{
				price: 100,
				qty: 7,
			},
		],
		asks: [],
	});
});

test("match multiple price levels", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 2,
	});
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 110,
		qty: 3,
	});
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 120,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 120,
		qty: 10,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 10,
		averagePrice: 113,
	});
});

test("limit buy orders should not cross above allowed price", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 2,
	});
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 110,
		qty: 3,
	});
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 130,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 110,
		qty: 10,
	});

	const depth = getDepth("BTC_USD");

	expect(result).toMatchObject({
		status: "PARTIALLY_FILLED",
		filledQty: 5,
		averagePrice: 106,
	});

	expect(depth).toMatchObject({
		symbol: "BTC_USD",
		bids: [
			{
				price: 110,
				qty: 5,
			},
		],
		asks: [
			{
				price: 130,
				qty: 5,
			},
		],
	});
});

test("market buy order fully filled", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "MARKET",
		symbol: "BTC_USD",
		price: null,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 5,
		averagePrice: 100,
	});
});

test("market buy order partially filled", () => {
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 2,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "MARKET",
		symbol: "BTC_USD",
		price: null,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "PARTIALLY_FILLED",
		filledQty: 2,
		averagePrice: 100,
	});
});

test("market order with empty book", () => {
	expect(() => {
		placeOrder({
			orderId: crypto.randomUUID(),
			userId: "2",
			side: "BUY",
			type: "MARKET",
			symbol: "BTC_USD",
			price: null,
			qty: 5,
		});
	}).toThrow("No liquidity");
});

test("market buy order consumes first seller at price level", () => {
	const firstOrder = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});
	placeOrder({
		orderId: crypto.randomUUID(),
		userId: "1",
		side: "SELL",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	const result = placeOrder({
		orderId: crypto.randomUUID(),
		userId: "2",
		side: "BUY",
		type: "LIMIT",
		symbol: "BTC_USD",
		price: 100,
		qty: 5,
	});

	expect(result).toMatchObject({
		status: "FILLED",
		filledQty: 5,
		averagePrice: 100,
	});

	expect(result.fills[0]?.sellOrderId).toBe(firstOrder.orderId);
});
