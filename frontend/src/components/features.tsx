import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Activity, Eye, Code, Bot } from "lucide-react";

const features = [
	{
		icon: Activity,
		title: "Real-Time Orderbook",
		description:
			"Watch orders hit the book in real-time. Understand market microstructure and order matching hands-on.",
	},
	{
		icon: Eye,
		title: "Observable Execution",
		description:
			"Inspect every trade, fill, and state change. Full transparency into how your orders execute.",
	},
	{
		icon: Code,
		title: "Developer-First",
		description:
			"Clean APIs, WebSocket feeds, and an interface built for people who read documentation.",
	},
	{
		icon: Bot,
		title: "Bot Marketplace",
		description:
			"Plug in trading bots, test strategies, and iterate — all in one playground. Coming soon.",
		soon: true,
	},
];

export function Features() {
	return (
		<section id="features" className="border-t px-6 py-24">
			<div className="mx-auto max-w-6xl">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-3xl font-bold tracking-tight">Why Atlas</h2>
					<p className="mx-auto max-w-lg text-muted-foreground">
						Everything you need to build, test, and understand trading systems.
					</p>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((f) => (
						<Card key={f.title} className="relative">
							{"soon" in f && f.soon && (
								<span className="absolute top-4 right-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
									Soon
								</span>
							)}
							<CardHeader>
								<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
									<f.icon className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-sm">{f.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}

export default Features;
