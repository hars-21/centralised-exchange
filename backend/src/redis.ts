import { createClient } from "redis";

export const QUEUE_ID = Math.random();

export const client = await createClient()
	.on("error", (err) => console.log("Redis error:", err))
	.connect();

const subscriber = await createClient()
	.on("error", (err) => console.log(err))
	.connect();

let pendingResolves: Record<number, (value: unknown) => void> = {};

async function pollQueue() {
	const response = await subscriber.brPop("response-queue-" + QUEUE_ID, 1);

	if (!response) {
		await pollQueue();
	} else {
		const parsedResponse = JSON.parse(response.element);
		console.log(parsedResponse);

		if (parsedResponse.identifier && pendingResolves[parsedResponse.identifier]) {
			pendingResolves[parsedResponse.identifier]!({ filledQty: parsedResponse.filledQty });
		}

		await pollQueue();
	}
}

pollQueue();

export function engineResponse(identifier: number) {
	return new Promise((resolve, reject) => {
		pendingResolves[identifier] = resolve;
	});
}
