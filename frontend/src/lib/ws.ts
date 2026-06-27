import { config } from "./env";

type Handler = (data: unknown) => void;

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 1000;

class WebSocketManager {
	private socket: WebSocket | null = null;
	private subscriptions = new Map<string, Set<Handler>>();
	private retryCount = 0;
	private retryTimer: ReturnType<typeof setTimeout> | null = null;
	private isIntentionallyClosed = false;

	private connect() {
		if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

		this.socket = new WebSocket(config.wsUrl);

		this.socket.onopen = () => {
			this.retryCount = 0;
			const channels = Array.from(this.subscriptions.keys());
			if (channels.length > 0) {
				this.send({ method: "SUBSCRIBE", params: channels });
			}
		};

		this.socket.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				const channel = data.event ? `${data.event}:${data.symbol}` : null;
				if (!channel) return;
				this.subscriptions.get(channel)?.forEach((h) => h(data));
			} catch (err) {
				console.error("WS message parse error:", err, event.data);
			}
		};

		this.socket.onclose = () => {
			if (this.isIntentionallyClosed) return;
			this.scheduleReconnect();
		};

		this.socket.onerror = () => {
			this.socket?.close();
		};
	}

	private scheduleReconnect() {
		if (this.retryCount >= MAX_RETRIES) return;
		const delay = BACKOFF_BASE_MS * 2 ** this.retryCount;
		this.retryTimer = setTimeout(() => {
			this.retryCount++;
			this.connect();
		}, delay);
	}

	private send(msg: object) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(msg));
		}
	}

	subscribe(channel: string, handler: Handler): () => void {
		if (!this.subscriptions.has(channel)) {
			this.subscriptions.set(channel, new Set());
			if (this.socket?.readyState === WebSocket.OPEN) {
				this.send({ method: "SUBSCRIBE", params: [channel] });
			}
		}
		this.subscriptions.get(channel)!.add(handler);

		if (!this.socket || this.socket.readyState > WebSocket.OPEN) {
			this.isIntentionallyClosed = false;
			this.connect();
		}

		return () => this.unsubscribe(channel, handler);
	}

	private unsubscribe(channel: string, handler: Handler) {
		const handlers = this.subscriptions.get(channel);
		if (!handlers) return;
		handlers.delete(handler);
		if (handlers.size === 0) {
			this.subscriptions.delete(channel);
			this.send({ method: "UNSUBSCRIBE", params: [channel] });
		}
		if (this.subscriptions.size === 0) {
			this.disconnect();
		}
	}

	private disconnect() {
		if (this.retryTimer) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}
		this.isIntentionallyClosed = true;
		this.socket?.close();
		this.socket = null;
	}
}

export const wsManager = new WebSocketManager();
