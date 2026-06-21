import type { DepthLevel } from "./domain";

export type EventMessage =
	| {
			event: "depth";
			symbol: string;
			asks: DepthLevel[];
			bids: DepthLevel[];
			lastUpdateId: number;
			timestamp: number;
	  }
	| {
			event: "trade";
			id: number;
			symbol: string;
			price: number;
			qty: number;
			maker: boolean;
			timestamp: number;
	  };
