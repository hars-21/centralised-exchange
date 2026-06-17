import bcrypt from "bcrypt";
import { prisma } from "../db";
import type { Request, Response } from "express";
import { authSchema } from "../types/auth";
import { createToken } from "../utils/auth";
import { sendValidationError } from "../utils/validation";
import { getUserId } from "./exchange";
import { sendToEngine } from "../utils/engineClient";

export async function signup(req: Request, res: Response) {
	const parsedBody = authSchema.safeParse(req.body);

	if (!parsedBody.success) {
		sendValidationError(res, parsedBody.error);
		return;
	}

	const { username, password } = parsedBody.data;
	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const user = await prisma.user.create({
			data: {
				username,
				password: hashedPassword,
			},
		});

		res
			.status(201)
			.cookie("token", createToken({ id: user.id }), {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
			})
			.json({
				userId: user.id,
				username: user.username,
			});
	} catch (e) {
		res.status(409).json({ error: "username already exists" });
	}
}

export async function signin(req: Request, res: Response) {
	const parsedBody = authSchema.safeParse(req.body);

	if (!parsedBody.success) {
		sendValidationError(res, parsedBody.error);
		return;
	}

	const { username, password } = parsedBody.data;

	try {
		const user = await prisma.user.findFirst({
			where: {
				username,
			},
		});

		if (!user) {
			res.status(400).json({ error: "Invalid username or password" });
			return;
		}

		let match = await bcrypt.compare(password, user.password);
		if (!match) {
			res.status(400).json({ error: "Invalid username or password" });
			return;
		}

		res
			.status(200)
			.cookie("token", createToken({ id: user.id }), {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
			})
			.json({
				userId: user.id,
				username: user.username,
			});
	} catch (e) {
		res.status(409).json({ error: "username does not exist" });
	}
}

export async function getUserData(req: Request, res: Response) {
	const userId = getUserId(req);

	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			res.status(400).json({ error: "User not found" });
			return;
		}

		const engineResponse = await sendToEngine("get_user_balance", { userId });

		if (!engineResponse.success) {
			res.status(400).json({ error: engineResponse.error });
			return;
		}

		res.status(200).json({
			userId: user.id,
			username: user.username,
			balance: engineResponse.data,
		});
	} catch (e) {
		res.status(409).json({ error: "username does not exist" });
	}
}
