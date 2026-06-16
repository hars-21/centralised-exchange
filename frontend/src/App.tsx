import "./index.css";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { SignupPage } from "./pages/signup";
import { ProfilePage } from "./pages/profile";
import { MarketPage } from "./pages/market";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignupPage />} />
			<Route path="/profile" element={<ProfilePage />} />
			<Route path="/market/:marketId" element={<MarketPage />} />
		</Routes>
	);
}
