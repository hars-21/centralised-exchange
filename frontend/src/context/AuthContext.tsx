import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
	id: string;
	username: string;
} | null;

type AuthContext = {
	user: User;
	setUser: (user: User) => void;
	loading: boolean;
};

export const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<User>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getMe = async () => {
			try {
				const res = await fetch("/me", {
					credentials: "include",
				});

				if (!res.ok) {
					setUser(null);
					return;
				}

				const data = await res.json();
				setUser(data.user);
			} catch (e) {
				setUser(null);
			} finally {
				setLoading(false);
			}
		};

		getMe();
	}, []);

	return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be inside AuthProvider");

	return context;
};
