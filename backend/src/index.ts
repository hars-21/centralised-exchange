import "dotenv";
import { engineAbortController, listenForEngineresponses, listenForOrderbookDepth } from "./utils/engineClient";
import { config } from "./config";
import { createAppServer } from "./server";
import { connectRedis, disconnectRedis } from "./redis";
import { prisma } from "./db";

const { httpServer, wss } = createAppServer();

async function main() {
	await connectRedis();

	listenForEngineresponses().catch((err) => console.error("Engine listener error:", err));
	listenForOrderbookDepth().catch((err) => console.error("Orderbook listener error:", err));

	httpServer.listen(config.app.port, () => {
		console.log(`HTTP + WS server running on port ${config.app.port}`);
	});
}

async function gracefulShutdown(signal: string) {
	console.log(`Received ${signal}, shutting down gracefully...`);

	const forceExit = setTimeout(() => {
		console.error("Graceful shutdown timed out, forcing exit");
		process.exit(1);
	}, 10000);

	engineAbortController.abort();

	httpServer.close();
	wss.close();

	await disconnectRedis();
	await prisma.$disconnect();

	clearTimeout(forceExit);
	process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

main();
