import { useParams } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { MarketHeader } from "../components/market/market-header";
import { Orderbook } from "../components/market/orderbook";
import { TradeForm } from "../components/market/trade-form";
import { OpenOrders } from "../components/market/open-orders";
import { useEffect, useState } from "react";

export function MarketPage() {
	const { marketId = "BTC" } = useParams();
	const [bids, setBids] = useState([]);
	const [asks, setAsks] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getDepth = async () => {
			try {
				const res = await fetch(`http://localhost:8000/markets/${marketId}/depth`);

				const data = await res.json();

				setBids(data.bids);
				setAsks(data.asks);
			} catch (e) {
				console.error(e);
			} finally {
				setLoading(false);
			}
		};

		getDepth();
	}, []);

	if (loading) return <p>Loading...</p>;

	return (
		<AppLayout>
			<div className="flex flex-col h-[calc(100vh-48px)] p-4 gap-4 bg-background/40 overflow-hidden">
				<MarketHeader market={marketId} />

				<div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
					<div className="flex flex-col bg-card rounded-xl border border-border/40 shadow-xs lg:w-72 xl:w-80 shrink-0 h-full overflow-hidden">
						<Orderbook bids={bids} asks={asks} />
					</div>

					<div className="flex flex-1 flex-col gap-4 h-full min-w-0">
						<div className="flex-1 bg-card rounded-xl border border-border/40 shadow-xs flex items-center justify-center min-h-50">
							<div className="text-center p-6">
								<p className="text-sm font-medium">Chart Visualization</p>
								<p className="text-xs text-muted-foreground mt-1">
									Replay and strategy analytics coming soon
								</p>
							</div>
						</div>

						<div className="bg-card rounded-xl border border-border/40 shadow-xs overflow-hidden h-55 shrink-0">
							<OpenOrders />
						</div>
					</div>

					<div className="flex flex-col bg-card rounded-xl border border-border/40 shadow-xs lg:w-72 xl:w-80 shrink-0 h-full overflow-hidden">
						<TradeForm marketId={marketId} />
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
