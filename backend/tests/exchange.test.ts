import { expect, test, mock } from "bun:test";

mock.module("../src/utils/engineClient", () => ({
	sendToEngine: mock(() => Promise.resolve({ success: true, data: {} })),
}));

import { createOrder, getOrder, cancelOrder, getDepth, getBalance } from "../src/controllers/exchange";

function mockReqRes(overrides = {}) {
	const req = { userId: "user-1", body: {}, params: {}, ...overrides } as any;
	const res = {
		status: mock(() => res),
		json: mock(() => undefined),
	} as any;
	return { req, res };
}

test("createOrder returns validation error for empty body", async () => {
	const { req, res } = mockReqRes();
	await createOrder(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
	expect(res.json).toHaveBeenCalledWith(
		expect.objectContaining({ error: "validation_error" }),
	);
});

test("createOrder returns validation error for invalid side", async () => {
	const { req, res } = mockReqRes({
		body: { type: "LIMIT", side: "INVALID", symbol: "BTC", price: 100, qty: 5 },
	});
	await createOrder(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
});

test("getOrder returns validation error for missing orderId", async () => {
	const { req, res } = mockReqRes({ params: {} });
	await getOrder(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
});

test("cancelOrder returns validation error for missing orderId", async () => {
	const { req, res } = mockReqRes({ params: {} });
	await cancelOrder(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
});

test("getDepth returns validation error for empty symbol", async () => {
	const { req, res } = mockReqRes({ params: { symbol: "" } });
	await getDepth(req, res);

	expect(res.status).toHaveBeenCalledWith(400);
});


