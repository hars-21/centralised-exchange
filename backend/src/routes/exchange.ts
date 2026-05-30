import { Router } from "express";
import { requireAuth } from "../utils/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
	// cancelOrder,
	createOrder,
	getBalance,
	getDepth,
	// getFills,
	// getOrders,
	// getStocks,
} from "../controllers/exchange";

export const exchangeRouter = Router();

// exchangeRouter.get("/orders", requireAuth, asyncHandler(getOrders));
exchangeRouter.get("/orderbook/:symbol", requireAuth, asyncHandler(getDepth));
// exchangeRouter.get("/fills/:symbol", requireAuth, asyncHandler(getFills));
// exchangeRouter.get("/stocks", requireAuth, asyncHandler(getStocks));
exchangeRouter.get("/balance", requireAuth, asyncHandler(getBalance));
exchangeRouter.post("/order", requireAuth, asyncHandler(createOrder));
// exchangeRouter.delete("/order", requireAuth, asyncHandler(cancelOrder));
