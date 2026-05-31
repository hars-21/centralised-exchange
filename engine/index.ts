import { createClient } from "redis";

const client = await createClient()
	.on("error", (err) => console.log("Redis error: ", err))
	.connect();

const publisher = await createClient()
	.on("error", (err) => console.log("Redis error: ", err))
	.connect();

while (1) {
	let response = await client.brPop("incoming-order", 1);

	if (!response) continue;

	const parsedResponse = JSON.parse(response.element);
	console.log(parsedResponse);

	const filledQty = parsedResponse.price;
	const identifier = parsedResponse.identifier;

	await publisher.lPush(
		"response-queue-" + parsedResponse.queueId,
		JSON.stringify({ filledQty, identifier }),
	);
}
