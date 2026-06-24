import { Router } from "express";
import { requireAuth } from "../utils/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
	cancelOrder,
	createOrder,
	getBalance,
	getDepth,
	getMarkets,
	getOrder,
	getOpenOrders,
	getTrades,
	getCandles,
} from "../controllers/exchange";

export const exchangeRouter = Router();

// Orders
exchangeRouter.get("/orders/open", requireAuth, asyncHandler(getOpenOrders));
exchangeRouter.post("/orders", requireAuth, asyncHandler(createOrder));
exchangeRouter.get("/orders/:orderId", requireAuth, asyncHandler(getOrder));
exchangeRouter.delete("/orders/:orderId", requireAuth, asyncHandler(cancelOrder));

// Markets
exchangeRouter.get("/markets", asyncHandler(getMarkets));
exchangeRouter.get("/markets/:symbol/depth", asyncHandler(getDepth));
exchangeRouter.get("/markets/:symbol/trades", asyncHandler(getTrades));
exchangeRouter.get("/markets/:symbol/candles", asyncHandler(getCandles));

// Balances
exchangeRouter.get("/balances", requireAuth, asyncHandler(getBalance));
