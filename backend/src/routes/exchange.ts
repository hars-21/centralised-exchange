import { Router } from "express";
import { requireAuth } from "../utils/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
	cancelOrder,
	createOrder,
	getBalance,
	getDepth,
	getFills,
	getOrder,
	getStocks,
} from "../controllers/exchange";

export const exchangeRouter = Router();

exchangeRouter.get("/order/:orderId", requireAuth, asyncHandler(getOrder));
exchangeRouter.get("/orderbook/:symbol", requireAuth, asyncHandler(getDepth));
exchangeRouter.get("/fills/:symbol", requireAuth, asyncHandler(getFills));
exchangeRouter.get("/stocks", requireAuth, asyncHandler(getStocks));
exchangeRouter.get("/balance", requireAuth, asyncHandler(getBalance));
exchangeRouter.post("/order", requireAuth, asyncHandler(createOrder));
exchangeRouter.delete("/order/:orderId", requireAuth, asyncHandler(cancelOrder));
