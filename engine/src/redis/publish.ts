import { publisher } from "./client";
import { env } from "../utils/env";
import type { Depth } from "../types/store";

export async function publishDepth(message: Depth) {
	if (!publisher.isOpen) {
		return;
	}
	await publisher.lPush(env.depthQueue, JSON.stringify(message));
}
