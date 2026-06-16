import { Inbox } from "lucide-react";

export function OpenOrders() {
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
						<tr>
							<td colSpan={7} className="px-5 py-10 text-center">
								<div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-2 py-4">
									<Inbox className="h-6 w-6 stroke-[1.5] text-muted-foreground/40" />
									<p className="text-xs font-medium">No open orders</p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
