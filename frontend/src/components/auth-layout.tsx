import { Link } from "react-router-dom";

export function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<Link to="/" className="text-xl font-semibold tracking-tight">
						Atlas
					</Link>
				</div>
				{children}
			</div>
		</div>
	);
}
