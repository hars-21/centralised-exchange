const API_BASE_URL =
	(typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) || "http://localhost:8000";

const WS_URL =
	(typeof process !== "undefined" && process.env?.VITE_WS_URL) || "ws://localhost:8080";

export const env = {
	apiBaseUrl: API_BASE_URL,
	wsUrl: WS_URL,
} as const;
