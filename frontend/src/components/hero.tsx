import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Terminal } from "lucide-react";

export function Hero() {
	return (
		<section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-14">
			<div className="mx-auto max-w-3xl text-center">
				<div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs text-muted-foreground">
					<Terminal className="h-3 w-3" />
					Observable Market Infrastructure
				</div>

				<h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
					Build, Test, and Understand{" "}
					<span className="text-primary">Trading Systems</span>
				</h1>

				<p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
					Transparent market infrastructure for developers. Replay markets, 
					inspect execution, simulate strategies, and deploy with confidence.
				</p>

				<div className="flex flex-wrap items-center justify-center gap-4">
					<Link to="/signup">
						<Button size="lg">
							Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
						</Button>
					</Link>
					<Link to="/market/BTC_USD">
						<Button size="lg" variant="outline">
							Open Market
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}

export default Hero;
