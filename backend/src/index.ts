import "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import { authRouter } from "./routes/auth";
import { exchangeRouter } from "./routes/exchange";
import { connectRedis, listenForEngineresponses, pingRedis, QUEUE_ID } from "./utils/engineClient";

await connectRedis();
void listenForEngineresponses();
const app = express();

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
	console.log("Response queue: ", QUEUE_ID);
});
