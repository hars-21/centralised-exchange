import btcLogo from "@/assets/btc-logo.svg";
import ethLogo from "@/assets/eth-logo.svg";
import solLogo from "@/assets/sol-logo.svg";
import usdLogo from "@/assets/usd-logo.svg";

export const ASSET_NAMES: Record<string, string> = {
	USD: "US Dollar",
	BTC: "Bitcoin",
	ETH: "Ethereum",
	SOL: "Solana",
};

export const COIN_LOGOS: Record<string, string> = {
	USD: usdLogo,
	BTC: btcLogo,
	ETH: ethLogo,
	SOL: solLogo,
};
