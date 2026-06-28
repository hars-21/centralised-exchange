import { serve, file } from "bun";

const production = process.env.NODE_ENV === "production";

if (production) {
	const server = serve({
		async fetch(req) {
			const url = new URL(req.url);
			const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
			const f = file(`./dist${filePath}`);
			const exists = await f.exists();
			if (exists) return new Response(f);
			return new Response(file("./dist/index.html"));
		},
	});

	console.log(`🚀 Server running at ${server.url}`);
} else {
	const index = await import("./index.html");
	const server = serve({
		routes: {
			"/*": index,
		},

		development: {
			// Enable browser hot reloading in development
			hmr: true,

			// Echo console logs from the browser to the server
			console: true,
		},
	});

	console.log(`🚀 Server running at ${server.url}`);
}
