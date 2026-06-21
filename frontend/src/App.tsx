import "./index.css";
import { Routes, Route, Link } from "react-router-dom";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { ProfilePage } from "./pages/profile";
import { MarketPage } from "./pages/market";
import { MarketsPage } from "./pages/markets";

function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
			<h1 className="text-6xl font-bold text-muted-foreground">404</h1>
			<p className="text-lg text-muted-foreground">Page not found</p>
			<Link to="/" className="text-primary hover:underline text-sm">Go home</Link>
		</div>
	);
}

export function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route path="/profile" element={<ProfilePage />} />
			<Route path="/markets" element={<MarketsPage />} />
			<Route path="/market/:symbol" element={<MarketPage />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}
