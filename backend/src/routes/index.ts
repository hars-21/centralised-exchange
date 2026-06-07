import { Router } from "express";
import { authRouter } from "./auth";
import { exchangeRouter } from "./exchange";

export const appRouter = Router();

appRouter.use(authRouter);
appRouter.use(exchangeRouter);
