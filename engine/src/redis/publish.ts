import { publisher } from "./client";
import type { Depth } from "../types/store";

export async function publishDepth(message: Depth, lastUpdateId: number) {
	if (!publisher.isOpen) {
		return;
	}

	await publisher.publish(
		`depth:${message.symbol}`,
		JSON.stringify({
			lastUpdateId,
			...message,
		}),
	);
}
