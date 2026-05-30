import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "";

interface TokenPayload {
	id: string;
}

export function createtoken(payload: TokenPayload): string {
	return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	const token =
		typeof authHeader === "string" && authHeader?.startsWith("Bearer")
			? authHeader.slice(7)
			: undefined;

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
}
