import z from "zod";

export const signupSchema = z.object({
	email: z.email().trim().min(1, "email is required"),
	username: z.string().trim().min(1, "username is required"),
	password: z.string().min(1, "password is required"),
});

export const signinSchema = z.object({
	login: z.string().trim().min(1, "email or username is required"),
	password: z.string().min(1, "password is required"),
});
