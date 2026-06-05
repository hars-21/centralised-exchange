import "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import { authRouter } from "./routes/auth";
import { exchangeRouter } from "./routes/exchange";
import {
	connectRedis,
	listenForEngineresponses,
	listenForOrderbookDepth,
	pingRedis,
	QUEUE_ID,
} from "./utils/engineClient";
import { WebSocketServer } from "ws";
import { subscriptionHandler } from "./utils/websocket";

await connectRedis();
void listenForEngineresponses();
void listenForOrderbookDepth();
const app = express();

const wss = new WebSocketServer({
	port: 8080,
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

app.use("/", authRouter);
app.use("/", exchangeRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);
	res.status(500).json({
		error: err instanceof Error ? err.message : "internal server error",
	});
});

app.listen(3000, () => {
	console.log("Server running on :3000");
	console.log("WebSocket server running on :8080");
	console.log("Response queue: ", QUEUE_ID);
});
