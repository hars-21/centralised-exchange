import bcrypt from "bcrypt";
import { prisma } from "../db";
import type { Request, Response } from "express";
import { authSchema } from "../types/auth";
import { createtoken } from "../utils/auth";

export async function signup(req: Request, res: Response) {
	const parsedBody = authSchema.safeParse(req.body);

	if (!parsedBody.success) {
		res.status(400).json({ error: parsedBody.error });
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

		res.status(201).json({
			token: createtoken({ id: user.id }),
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
		res.status(400).json({ error: parsedBody.error });
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

		res.status(200).json({
			token: createtoken({ id: user.id }),
			userId: user.id,
			username: user.username,
		});
	} catch (e) {
		res.status(409).json({ error: "username does not exist" });
	}
}
