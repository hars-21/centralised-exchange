import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => {
	console.log("Redis client error: ", err);
});

await client.connect();

await client.pSubscribe("trade:*", (message, channel) => {
	console.log(channel, message);
});
