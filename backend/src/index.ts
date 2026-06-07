import "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import {
	connectRedis,
	listenForEngineresponses,
	listenForOrderbookDepth,
	pingRedis,
} from "./utils/engineClient";
import { WebSocketServer } from "ws";
import { subscriptionHandler } from "./utils/websocket";
import { appRouter } from "./routes";
import { env } from "./utils/env";

await connectRedis();
void listenForEngineresponses();
void listenForOrderbookDepth();

const app = express();

const wss = new WebSocketServer({ port: env.websocketPort }, () => {
	console.log(`WebSocket server running on http://localhost:${env.websocketPort}`);
});
subscriptionHandler(wss);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
	res.status(200).json({
		message: "Welcome to Centralised Exchange",
		status: "running",
		success: true,
	});
});

app.get("/health", async (_req: Request, res: Response) => {
	await pingRedis();
	res.status(200).json({ success: true });
});

app.use("/", appRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(500).json({
		error: err instanceof Error ? err.message : "internal server error",
	});
});

app.listen(env.port, () => {
	console.log(`Server running on http://localhost:${env.port}`);
});
