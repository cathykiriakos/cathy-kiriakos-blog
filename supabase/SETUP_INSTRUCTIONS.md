# Supabase Database Setup Instructions

## Issue: GitHub Action Failing with "no unique or exclusion constraint" Error

Your GitHub Actions are failing because the database tables are missing unique constraints required for upsert operations.

## Solution: Apply Database Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/add_unique_constraints.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /home/user/cathy-kiriakos-blog

# Apply the migration
supabase db push
```

## What These Constraints Do

### 1. market_data table
- **Constraint**: `UNIQUE (ticker, data_date)`
- **Purpose**: Ensures each stock ticker can only have one entry per date
- **Example**: Prevents duplicate entries for NVDA on 2025-12-29

### 2. news_items table
- **Constraint**: `UNIQUE (title, published_date)`
- **Purpose**: Prevents duplicate news articles with the same title on the same date
- **Example**: Ensures an article titled "AI Breakthrough" published on 2025-12-29 is only saved once

## Verifying the Fix

After applying the migration:

1. **Test locally** (if you have access to run the scripts):
   ```bash
   node scripts/fetch-market-data.js
   node scripts/fetch-ai-news.js
   ```

2. **Or trigger the GitHub Action manually**:
   - Go to your GitHub repository
   - Click **Actions** tab
   - Select **Daily Market & News Update** workflow
   - Click **Run workflow**

The error should be resolved and you should see:
- ✅ Successfully updated X companies
- ✅ Successfully saved X news items

## Alternative: If You Can't Modify the Database

If for some reason you cannot add unique constraints, you can modify the scripts to use simple `insert` instead of `upsert`. However, this is **NOT recommended** as it will cause duplicate entries over time.
