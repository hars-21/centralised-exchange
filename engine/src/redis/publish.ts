import { publisher } from "./client";
import type { Depth } from "../types/domain";

export async function publishEvent(message: Depth, lastUpdateId: number) {
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
