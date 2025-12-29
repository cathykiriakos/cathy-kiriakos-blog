-- Migration: Add unique constraints for upsert operations
-- This enables the GitHub Action scripts to use upsert with onConflict

-- Add unique constraint for market_data table
-- Ensures each ticker can only have one entry per date
ALTER TABLE market_data
ADD CONSTRAINT market_data_ticker_date_unique
UNIQUE (ticker, data_date);

-- Add unique constraint for news_items table
-- Ensures each article title can only appear once per published date
ALTER TABLE news_items
ADD CONSTRAINT news_items_title_date_unique
UNIQUE (title, published_date);
