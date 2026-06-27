import { createServer } from "http";
import { WebSocketServer } from "ws";
import { app } from "./app";
import { subscriptionHandler } from "./utils/websocket";

export function createAppServer() {
	const httpServer = createServer(app);

	const wss = new WebSocketServer({ server: httpServer });

	subscriptionHandler(wss);

	return { httpServer, wss };
}
