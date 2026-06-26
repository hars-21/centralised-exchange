import { pool } from "./db";
import { connectRedis, publisher, streamReader } from "./redis";
import type { Candle, Trade } from "./types";

await connectRedis();

let isFlushing = false;
let lastID = (await streamReader.get("candle_worker_id")) ?? "0-0";
const openCandles: Map<string, Candle> = new Map();

setTimeout(
	() => {
		setInterval(async () => {
			if (isFlushing) return;

			isFlushing = true;
			try {
				await flushCandles();
			} finally {
				isFlushing = false;
			}
		}, 60000);
	},
	60000 - (Date.now() % 60000),
);

for (;;) {
	const streams = await streamReader.xRead({ key: "trade", id: lastID }, { BLOCK: 0 });
	if (!streams) continue;

	for (const stream of streams) {
		for (const message of stream.messages) {
			const msg = message.message;

			try {
				const trade: Trade = JSON.parse(msg.data);
				deriveData(trade);
				await streamReader.set("candle_worker_id", message.id);
			} catch (err) {
				console.error(err);
			}

			lastID = message.id;
		}
	}
}

function deriveData(data: Trade) {
	const { symbol, price, qty, timestamp } = data;

	const bucket = getBucket(timestamp);
	const currentCandle = openCandles.get(`${symbol}_${bucket}`);

	if (!currentCandle) {
		const candle: Candle = {
			time: bucket,
			open: price,
			high: price,
			low: price,
			close: price,
			volume: qty,
			symbol,
		};
		openCandles.set(`${symbol}_${bucket}`, candle);
	} else {
		currentCandle.high = Math.max(currentCandle.high, price);
		currentCandle.low = Math.min(currentCandle.low, price);
		currentCandle.close = price;
		currentCandle.volume += qty;
	}
}

function getBucket(time: number) {
	return time - (time % 60000);
}

async function flushCandles() {
	const currentBucket = getBucket(Date.now());
	for (const [key, candle] of openCandles) {
		if (candle.time < currentBucket) {
			const timestamp = new Date(candle.time);

			try {
				await publisher.publish(`candle:${candle.symbol}`, JSON.stringify({ event: "candle", ...candle }));

				await pool.query(
					`INSERT INTO "Candle" (symbol, open, high, low, close, volume, time) Values ($1, $2, $3, $4, $5, $6, $7)`,
					[
						candle.symbol,
						candle.open,
						candle.high,
						candle.low,
						candle.close,
						candle.volume,
						timestamp,
					],
				);
			} catch (err) {
				console.error(err);
			}

			openCandles.delete(key);
		}
	}
}
