import { expect, test, mock } from "bun:test";
import { createToken, requireAuth } from "../src/utils/auth";

test("createToken returns a valid JWT", () => {
	const token = createToken({ id: "user-1" });
	expect(typeof token).toBe("string");
	expect(token.split(".")).toHaveLength(3);
});

test("requireAuth returns 401 when no token provided", () => {
	const req = { headers: {} } as any;
	const res = {
		status: mock(() => res),
		json: mock(() => undefined),
	} as any;
	const next = mock(() => undefined);

	requireAuth(req, res, next);

	expect(res.status).toHaveBeenCalledWith(401);
	expect(res.json).toHaveBeenCalledWith({ error: "Missing auth token" });
	expect(next).not.toHaveBeenCalled();
});

test("requireAuth returns 401 for invalid token", () => {
	const req = { headers: { authorization: "Bearer invalid-token" } } as any;
	const res = {
		status: mock(() => res),
		json: mock(() => undefined),
	} as any;
	const next = mock(() => undefined);

	requireAuth(req, res, next);

	expect(res.status).toHaveBeenCalledWith(401);
	expect(res.json).toHaveBeenCalledWith({ error: "Invalid auth token" });
	expect(next).not.toHaveBeenCalled();
});

test("requireAuth calls next for valid token", () => {
	const token = createToken({ id: "user-1" });
	const req = { headers: { authorization: `Bearer ${token}` } } as any;
	const res = {
		status: mock(() => res),
		json: mock(() => undefined),
	} as any;
	const next = mock(() => undefined);

	requireAuth(req, res, next);

	expect(next).toHaveBeenCalled();
});
