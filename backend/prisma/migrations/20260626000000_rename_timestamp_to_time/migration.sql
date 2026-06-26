-- Rename timestamp column to time
ALTER TABLE "Candle" RENAME COLUMN "timestamp" TO "time";

-- Rename indexes to match new column name
ALTER INDEX "Candle_timestamp_idx" RENAME TO "Candle_time_idx";
ALTER INDEX "Candle_symbol_timestamp_key" RENAME TO "Candle_symbol_time_key";
