import type { EngineResponse } from "../types/engine";

interface PendingResponses {
	resolve: (response: EngineResponse) => void;
	reject: (error: Error) => void;
}

let pendingResponses: Record<string, PendingResponses> = {};

export function waitForEngineResponse(correlationId: string): Promise<EngineResponse> {
	return new Promise((resolve, reject) => {
		pendingResponses[correlationId] = { resolve, reject };
	});
}

export function resolveEngineResponse(response: EngineResponse) {
	const pending = pendingResponses[response.correlationId];
	if (!pending) return;

	delete pendingResponses[response.correlationId];
	pending.resolve(response);
}
