import WebSocket, { WebSocketServer } from "ws";

export const activeSubscriptions: Record<string, WebSocket[]> = {};

export function subscriptionHandler(server: WebSocketServer) {
	server.on("connection", (socket) => {
		socket.on("message", (data) => {
			const parsedData = JSON.parse(data.toString());

			if (parsedData.method === "SUBSCRIBE") {
				parsedData.params.forEach((param: string) => {
					if (!activeSubscriptions[param]) {
						activeSubscriptions[param] = [];
					}

					activeSubscriptions[param].push(socket);
				});
			}

			if (parsedData.method === "UNSUBSCRIBE") {
				parsedData.params.forEach((param: string) => {
					if (!activeSubscriptions[param]) {
						activeSubscriptions[param] = [];
					}

					activeSubscriptions[param] = activeSubscriptions[param].filter((x) => x == socket);
				});
			}
		});
	});
}
