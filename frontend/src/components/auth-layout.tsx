import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../lib/theme-provider";

export function AuthLayout({ children }: { children: React.ReactNode }) {
	const { theme, toggleTheme } = useTheme();

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12">
			<div className="absolute top-4 right-4">
				<Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
					{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
				</Button>
			</div>
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<Link to="/" className="text-xl font-semibold tracking-tight hover:text-primary transition-colors">
						Atlas
					</Link>
				</div>
				{children}
			</div>
		</div>
	);
}
