import { useParams, Link } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { MarketHeader } from "../components/market/market-header";
import { Orderbook } from "../components/market/orderbook";
import { TradeForm } from "../components/market/trade-form";
import { OpenOrders } from "../components/market/open-orders";
import { Button } from "../components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "../components/ui/skeleton";
import type { DepthLevel, OrderBook, StreamResponse } from "@/types";

export function MarketPage() {
	const { symbol = "BTC_USD" } = useParams();
	const { user, loading: authLoading } = useAuth();
	const [loading, setLoading] = useState(true);

	const [orderbook, setOrderbook] = useState<OrderBook>({
		bids: {},
		asks: {},
	});
	const buffer: StreamResponse[] = [];

	useEffect(() => {
		const streamDepth = async () => {
			try {
				let orderbookInitialized = false;
				const ws = new WebSocket("ws://localhost:8080");
				ws.onmessage = (msg) => {
					const parsedMessage = JSON.parse(msg.data);

					const { lastUpdateId, bids, asks } = parsedMessage;

					if (!orderbookInitialized) {
						buffer.push({ bids, asks, lastUpdateId });
					} else {
						updateOrderbook(bids, asks);
					}
				};

				ws.onopen = async () => {
					try {
						ws.send(JSON.stringify({ method: "SUBSCRIBE", params: [`depth:${symbol}`] }));

						const res = await fetch(`http://localhost:8000/markets/${symbol}/depth`);
						const { lastUpdateId, bids, asks } = await res.json();

						initializeOrderbook(bids, asks);
						orderbookInitialized = true;

						buffer.forEach((msg) => {
							if (msg.lastUpdateId < lastUpdateId) {
								updateOrderbook(msg.bids, msg.asks);
							}
						});
					} catch (e) {
						console.error(e);
					}
				};

				ws.onclose = () => {
					ws.send(JSON.stringify({ method: "UNSUBSCRIBE", params: [`depth:${symbol}`] }));
				};
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};

		streamDepth();
	}, []);

	const initializeOrderbook = (bids: DepthLevel[], asks: DepthLevel[]) => {
		const bidsMap: Record<number, number> = {};
		const asksMap: Record<number, number> = {};

		bids.forEach(({ price, qty }) => {
			bidsMap[price] = qty;
		});

		asks.forEach(({ price, qty }) => {
			asksMap[price] = qty;
		});

		setOrderbook({
			bids: bidsMap,
			asks: asksMap,
		});
	};

	const updateOrderbook = (updatedBids: DepthLevel[], updatedAsks: DepthLevel[]) => {
		setOrderbook((prev) => {
			const bids = { ...prev.bids };
			const asks = { ...prev.asks };

			updatedBids.forEach(({ price, qty }) => {
				if (qty === 0) {
					delete bids[price];
				} else {
					bids[price] = qty;
				}
			});

			updatedAsks.forEach(({ price, qty }) => {
				if (qty === 0) {
					delete asks[price];
				} else {
					asks[price] = qty;
				}
			});

			return {
				bids,
				asks,
			};
		});
	};

	const isDataLoading = loading || authLoading;

	return (
		<AppLayout>
			<div className="flex flex-col h-[calc(100vh-48px)] p-4 gap-4 bg-background/40 overflow-hidden">
				<MarketHeader market={symbol} />

				<div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
					<div className="flex flex-col bg-card rounded-xl border border-border/40 shadow-xs lg:w-72 xl:w-80 shrink-0 h-full overflow-hidden">
						<Orderbook
							bids={orderbook.bids}
							asks={orderbook.asks}
							loading={isDataLoading}
							symbol={symbol}
						/>
					</div>

					<div className="flex flex-1 flex-col gap-4 h-full min-w-0">
						{isDataLoading ? (
							<div className="flex-1 bg-card rounded-xl border border-border/40 shadow-xs p-6 flex flex-col justify-between min-h-50 animate-pulse">
								<div className="flex justify-between items-center">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-4 w-12" />
								</div>
								<div className="flex-1 flex flex-col justify-end gap-2.5 py-6">
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-5 w-5/6" />
									<Skeleton className="h-3.5 w-full" />
								</div>
								<div className="flex justify-between">
									<Skeleton className="h-3 w-8" />
									<Skeleton className="h-3 w-8" />
									<Skeleton className="h-3 w-8" />
								</div>
							</div>
						) : (
							<div className="flex-1 bg-card rounded-xl border border-border/40 shadow-xs flex items-center justify-center min-h-50">
								<div className="text-center p-6">
									<p className="text-sm font-medium">Chart Visualization</p>
									<p className="text-xs text-muted-foreground mt-1">
										Replay and strategy analytics coming soon
									</p>
								</div>
							</div>
						)}

						<div className="bg-card rounded-xl border border-border/40 shadow-xs overflow-hidden h-55 shrink-0">
							<OpenOrders loading={isDataLoading} />
						</div>
					</div>

					<div className="flex flex-col bg-card rounded-xl border border-border/40 shadow-xs lg:w-72 xl:w-80 shrink-0 h-full overflow-hidden">
						{user ? (
							<TradeForm symbol={symbol} />
						) : (
							<div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
								<p className="text-sm text-muted-foreground">Sign in to start trading</p>
								<Link to="/login">
									<Button size="sm">Sign in</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
