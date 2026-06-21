import { publisher } from "./client";
import type { EventMessage } from "../types/event";

export async function publishEvent(message: EventMessage) {
	if (!publisher.isOpen) {
		return;
	}

	await publisher.publish(`${message.event}:${message.symbol}`, JSON.stringify(message));
}
