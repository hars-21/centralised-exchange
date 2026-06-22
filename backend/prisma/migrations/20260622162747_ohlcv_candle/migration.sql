-- TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- CreateTable
CREATE TABLE "Candle" (
    "symbol" TEXT NOT NULL,
    "open" INTEGER NOT NULL,
    "high" INTEGER NOT NULL,
    "low" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,
    "volume" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL
);

-- CreateIndex
CREATE INDEX "Candle_timestamp_idx" ON "Candle"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Candle_symbol_timestamp_key" ON "Candle"("symbol", "timestamp");

-- HyperTable
SELECT create_hypertable('"Candle"', 'timestamp');

