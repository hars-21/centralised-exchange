function readEnv(key: string, fallback: string): string {
	const val =
		typeof process !== "undefined" && process.env
			? (process.env[key] ?? process.env[`BUN_PUBLIC_${key}`])
			: undefined;

	if (
		val &&
		!val.startsWith("http://") &&
		!val.startsWith("ws://") &&
		!val.startsWith("https://")
	) {
		throw new Error(`Invalid ${key}: must be a valid URL`);
	}

	return val ?? fallback;
}

export const config = {
	apiBaseUrl: readEnv("API_BASE_URL", "http://localhost:8000"),
	wsUrl: readEnv("WS_URL", "ws://localhost:8000"),
} as const;
