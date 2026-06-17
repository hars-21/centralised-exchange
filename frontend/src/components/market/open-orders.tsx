import { Inbox, X } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import type { OrderRecord } from "@/types";

export function OpenOrders({ loading }: { loading?: boolean }) {
	const [orders, setOrders] = useState<OrderRecord[]>([]);

	const fetchOpenOrders = async () => {
		try {
			const res = await fetch("http://localhost:8000/orders/open", {
				credentials: "include",
			});

			const data = await res.json();
			setOrders(data);
		} catch (e) {
			console.error(e);
		}
	};

	const handleCancel = async (orderId: string) => {
		try {
			await fetch(`http://localhost:8000/orders/${orderId}`, {
				method: "DELETE",
				credentials: "include",
			});
			fetchOpenOrders();
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		fetchOpenOrders();
	}, []);

	if (loading) {
		return (
			<div className="flex flex-col h-full select-none animate-pulse">
				<div className="flex items-center justify-between border-b border-border/40 px-5 py-3 bg-muted/15">
					<Skeleton className="h-4 w-28" />
				</div>
				<div className="overflow-auto flex-1 min-h-0">
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-border/30 text-left text-muted-foreground bg-muted/5 font-mono">
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
									Market
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
									Side
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
									Type
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
									Price
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
									Size
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
									Filled
								</th>
								<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 3 }).map((_, i) => (
								<tr key={i} className="border-b border-border/20">
									<td className="px-5 py-3">
										<Skeleton className="h-3.5 w-12" />
									</td>
									<td className="px-5 py-3">
										<Skeleton className="h-3.5 w-8" />
									</td>
									<td className="px-5 py-3">
										<Skeleton className="h-3.5 w-10" />
									</td>
									<td className="px-5 py-3 text-right">
										<Skeleton className="h-3.5 w-16 ml-auto" />
									</td>
									<td className="px-5 py-3 text-right">
										<Skeleton className="h-3.5 w-12 ml-auto" />
									</td>
									<td className="px-5 py-3 text-right">
										<Skeleton className="h-3.5 w-12 ml-auto" />
									</td>
									<td className="px-5 py-3 text-right">
										<Skeleton className="h-3.5 w-14 ml-auto" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full select-none">
			<div className="flex items-center justify-between border-b border-border/40 px-5 py-3 bg-muted/15">
				<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Open Orders
				</h2>
			</div>

			<div className="overflow-auto flex-1 min-h-0">
				<table className="w-full text-xs">
					<thead>
						<tr className="border-b border-border/30 text-left text-muted-foreground bg-muted/5 font-mono">
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
								Market
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
								Side
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px]">
								Type
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
								Price
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
								Size
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
								Filled
							</th>
							<th className="px-5 py-2.5 font-semibold uppercase tracking-wider text-[10px] text-right">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{orders?.length > 0 ? (
							orders.map((order) => (
								<tr
									key={order.orderId}
									className="border-b border-border/20 hover:bg-muted/10 transition-colors"
								>
									<td className="px-5 py-3 font-mono text-[11px]">
										{order.symbol.replace("_", "/")}
									</td>
									<td
										className={`px-5 py-3 font-mono text-[11px] font-medium ${order.side === "BUY" ? "text-green-500" : "text-red-500"}`}
									>
										{order.side}
									</td>
									<td className="px-5 py-3 font-mono text-[11px]">{order.type}</td>
									<td className="px-5 py-3 font-mono text-[11px] text-right">
										{order.price?.toFixed(2) ?? "-"}
									</td>
									<td className="px-5 py-3 font-mono text-[11px] text-right">{order.qty}</td>
									<td className="px-5 py-3 font-mono text-[11px] text-right">
										{order.filledQty > 0 ? (
											<span className="text-orange-500">
												{((order.filledQty / order.qty) * 100).toFixed(1)}%
											</span>
										) : (
											<span className="text-muted-foreground">0%</span>
										)}
									</td>
									<td className="px-5 py-3 text-right">
										<button
											onClick={() => handleCancel(order.orderId)}
											className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
										>
											<X className="h-3.5 w-3.5" />
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={7} className="px-5 py-10 text-center">
									<div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-2 py-4">
										<Inbox className="h-6 w-6 stroke-[1.5] text-muted-foreground/40" />
										<p className="text-xs font-medium">No open orders</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
