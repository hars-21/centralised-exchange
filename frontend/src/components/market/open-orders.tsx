export function OpenOrders() {
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between border-b px-4 py-2">
				<h2 className="text-xs font-medium text-muted-foreground">Open Orders</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-xs">
					<thead>
						<tr className="border-b text-left text-muted-foreground">
							<th className="px-4 py-2 font-medium">Market</th>
							<th className="px-4 py-2 font-medium">Side</th>
							<th className="px-4 py-2 font-medium">Type</th>
							<th className="px-4 py-2 font-medium text-right">Price</th>
							<th className="px-4 py-2 font-medium text-right">Qty</th>
							<th className="px-4 py-2 font-medium text-right">Filled</th>
							<th className="px-4 py-2 font-medium text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
								No open orders
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
