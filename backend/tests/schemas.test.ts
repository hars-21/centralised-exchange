import { expect, test } from "bun:test";
import { signupSchema, signinSchema } from "../src/types/auth";
import {
	orderBodySchema,
	orderIdParamSchema,
	symbolParamSchema,
	statusQuerySchema,
} from "../src/types/exchange";

test("signup schema accepts valid input", () => {
	const result = signupSchema.safeParse({
		email: "alice@test.com",
		username: "alice",
		password: "secret123",
	});
	expect(result.success).toBe(true);
});

test("signup schema rejects invalid email", () => {
	const result = signupSchema.safeParse({
		email: "not-an-email",
		username: "alice",
		password: "secret123",
	});
	expect(result.success).toBe(false);
});

test("signup schema rejects empty username", () => {
	const result = signupSchema.safeParse({
		email: "alice@test.com",
		username: " ",
		password: "secret123",
	});
	expect(result.success).toBe(false);
});

test("signup schema rejects empty password", () => {
	const result = signupSchema.safeParse({
		email: "alice@test.com",
		username: "alice",
		password: "",
	});
	expect(result.success).toBe(false);
});

test("signup schema rejects empty email", () => {
	const result = signupSchema.safeParse({ email: "", username: "alice", password: "secret" });
	expect(result.success).toBe(false);
});

test("signin schema accepts email as login", () => {
	const result = signinSchema.safeParse({ login: "alice@test.com", password: "secret" });
	expect(result.success).toBe(true);
});

test("signin schema accepts username as login", () => {
	const result = signinSchema.safeParse({ login: "alice", password: "secret" });
	expect(result.success).toBe(true);
});

test("signin schema rejects empty login", () => {
	const result = signinSchema.safeParse({ login: " ", password: "secret" });
	expect(result.success).toBe(false);
});

test("signin schema rejects empty password", () => {
	const result = signinSchema.safeParse({ login: "alice", password: "" });
	expect(result.success).toBe(false);
});

test("order body schema accepts valid LIMIT order", () => {
	const result = orderBodySchema.safeParse({
		type: "LIMIT",
		side: "BUY",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});
	expect(result.success).toBe(true);
});

test("order body schema accepts valid MARKET order", () => {
	const result = orderBodySchema.safeParse({
		type: "MARKET",
		side: "SELL",
		symbol: "ETH",
		qty: 10,
	});
	expect(result.success).toBe(true);
});

test("order body schema rejects LIMIT order without price", () => {
	const result = orderBodySchema.safeParse({
		type: "LIMIT",
		side: "BUY",
		symbol: "BTC",
		qty: 5,
	});
	expect(result.success).toBe(false);
});

test("order body schema rejects negative qty", () => {
	const result = orderBodySchema.safeParse({
		type: "LIMIT",
		side: "BUY",
		symbol: "BTC",
		price: 100,
		qty: -1,
	});
	expect(result.success).toBe(false);
});

test("order body schema rejects invalid side", () => {
	const result = orderBodySchema.safeParse({
		type: "LIMIT",
		side: "INVALID",
		symbol: "BTC",
		price: 100,
		qty: 5,
	});
	expect(result.success).toBe(false);
});

test("symbol param schema accepts valid symbol", () => {
	const result = symbolParamSchema.safeParse({ symbol: "BTC" });
	expect(result.success).toBe(true);
});

test("symbol param schema rejects empty symbol", () => {
	const result = symbolParamSchema.safeParse({ symbol: "" });
	expect(result.success).toBe(false);
});

test("orderId param schema accepts valid id", () => {
	const result = orderIdParamSchema.safeParse({ orderId: "abc-123" });
	expect(result.success).toBe(true);
});

test("orderId param schema rejects empty id", () => {
	const result = orderIdParamSchema.safeParse({ orderId: "" });
	expect(result.success).toBe(false);
});

test("status query schema accepts valid statuses", () => {
	for (const status of ["OPEN", "PARTIALLY_FILLED", "FILLED", "CANCELLED"]) {
		const result = statusQuerySchema.safeParse({ status });
		expect(result.success).toBe(true);
	}
});
