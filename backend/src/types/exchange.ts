import z from "zod";

export const symbolParamSchema = z.object({
	symbol: z.string().trim().min(1, "symbol is required"),
});

export const orderIdParamSchema = z.object({
	orderId: z.string().trim().min(1, "orderId is required"),
});

export const statusQuerySchema = z.object({
	status: z.enum(["PENDING", "PARTIALLY_FILLED", "FILLED", "CANCELLED"]).optional(),
});

export const orderBodySchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("LIMIT"),
		side: z.enum(["BUY", "SELL"]),
		symbol: z.string().trim().min(1, "symbol is required"),
		price: z.number().positive("limit orders require a positive price"),
		qty: z.number().positive("qty must be a positive number"),
	}),
	z.object({
		type: z.literal("MARKET"),
		side: z.enum(["BUY", "SELL"]),
		symbol: z.string().trim().min(1, "symbol is required"),
		price: z.null().optional(),
		qty: z.number().positive("qty must be a positive number"),
	}),
]);
