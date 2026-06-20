import z from "zod";

export const orderPayloadSchema = z.discriminatedUnion("type", [
	z.object({
		userId: z.string().trim().min(1, "userId is required"),
		type: z.literal("LIMIT"),
		side: z.enum(["BUY", "SELL"]),
		symbol: z.string().trim().min(1, "symbol is required"),
		price: z.number().positive("limit orders require a positive price"),
		qty: z.number().positive("qty must be a positive number"),
	}),
	z.object({
		userId: z.string().trim().min(1, "userId is required"),
		type: z.literal("MARKET"),
		side: z.enum(["BUY", "SELL"]),
		symbol: z.string().trim().min(1, "symbol is required"),
		price: z.null(),
		qty: z.number().positive("qty must be a positive number"),
	}),
]);

export const symbolPayloadSchema = z.object({
	symbol: z.string().trim().min(1, "symbol is required"),
});

export const userPayloadSchema = z.object({
	userId: z.string().trim().min(1, "userId is required"),
});

export const orderIdPayloadSchema = z.object({
	userId: z.string().trim().min(1, "userId is required"),
	orderId: z.string().trim().min(1, "orderId is required"),
});
