import { publisher } from "./client";
import type { EventMessage } from "../types/event";

export async function publishEvent(message: EventMessage) {
	if (!publisher.isOpen) {
		return;
	}

	await publisher.publish(`${message.event}:${message.symbol}`, JSON.stringify(message));

	if (message.event === "trade") {
		await publisher.xAdd(`${message.event}`, "*", {
			data: JSON.stringify(message),
		});
	}
}
