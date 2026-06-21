import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Missing DATABASE_URL");

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function seed() {
	const markets = [
		{ symbol: "BTC_USD", name: "Bitcoin/USD" },
		{ symbol: "SOL_USD", name: "Solana/USD" },
		{ symbol: "ETH_USD", name: "Ethereum/USD" },
	];

	for (const market of markets) {
		await prisma.market.upsert({
			where: { symbol: market.symbol },
			update: {},
			create: market,
		});
	}

	const password = await bcrypt.hash("demo123", 10);
	const users = [
		{ username: "alice", password },
		{ username: "bob", password },
	];

	for (const user of users) {
		await prisma.user.upsert({
			where: { username: user.username },
			update: {},
			create: user,
		});
	}

	console.log("Seeded: 3 markets, 2 users (alice/bob, password: demo123)");
	process.exit(0);
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
