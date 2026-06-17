import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

import { ThemeProvider } from "./lib/theme-provider";
import { AuthProvider } from "./context/AuthContext";

const elem = document.getElementById("root")!;
const app = (
	<StrictMode>
		<ThemeProvider>
			<BrowserRouter>
				<AuthProvider>
					<App />
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	</StrictMode>
);

if (import.meta.hot) {
	const root = (import.meta.hot.data.root ??= createRoot(elem));
	root.render(app);
} else {
	createRoot(elem).render(app);
}
