export function Orderbook() {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b px-3 py-2">
				<h2 className="text-xs font-medium text-muted-foreground">Orderbook</h2>
			</div>

			<div className="flex border-b px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
				<span className="flex-1">Price</span>
				<span className="flex-1 text-right">Qty</span>
				<span className="flex-1 text-right">Total</span>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="flex flex-1 flex-col justify-end px-3 py-1">
					<p className="py-8 text-center text-xs text-muted-foreground">No asks</p>
				</div>

				<div className="border-y px-3 py-1.5 text-center">
					<span className="font-mono text-xs text-muted-foreground">Spread: —</span>
				</div>

				<div className="flex flex-1 flex-col px-3 py-1">
					<p className="py-8 text-center text-xs text-muted-foreground">No bids</p>
				</div>
			</div>
		</div>
	);
}
