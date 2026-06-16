import { useParams } from "react-router-dom";
import { AppLayout } from "../components/app-layout";
import { MarketHeader } from "../components/market/market-header";
import { Orderbook } from "../components/market/orderbook";
import { TradeForm } from "../components/market/trade-form";
import { OpenOrders } from "../components/market/open-orders";

export function MarketPage() {
	const { marketId = "BTC_USD" } = useParams();

	return (
		<AppLayout>
			<MarketHeader market={marketId} />
			<div className="flex flex-1 flex-col lg:flex-row" style={{ height: "calc(100vh - 84px)" }}>
				<div className="flex flex-1 flex-col border-r lg:max-w-70">
					<Orderbook />
				</div>

				<div className="flex flex-1 flex-col">
					<div className="flex-1 border-b">
						<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
							Chart — coming soon
						</div>
					</div>
					<div className="border-t">
						<OpenOrders />
					</div>
				</div>

				<div className="border-l lg:w-70">
					<TradeForm />
				</div>
			</div>
		</AppLayout>
	);
}
