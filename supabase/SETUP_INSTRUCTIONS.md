# Supabase Database Setup Instructions

## Common Issues

### Issue 1: GitHub Action Failing with "no unique or exclusion constraint" Error

Your GitHub Actions are failing because the database tables are missing unique constraints required for upsert operations.

### Issue 2: Row Level Security (RLS) Blocking Data Access

If your frontend shows no data or you get RLS permission errors, it's because RLS policies are blocking public read access.

## Solution: Apply Both Database Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/cathy-kiriakos-blog
2. Navigate to **SQL Editor** in the left sidebar
3. **First Migration: Add Unique Constraints**
   - Click **New Query**
   - Copy and paste the contents of `supabase/migrations/add_unique_constraints.sql`
   - Click **Run** to execute the migration
4. **Second Migration: Configure RLS Policies**
   - Click **New Query** again
   - Copy and paste the contents of `supabase/migrations/configure_rls_policies.sql`
   - Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd /home/user/cathy-kiriakos-blog

# Apply the migration
supabase db push
```

## What These Migrations Do

### Migration 1: Unique Constraints (`add_unique_constraints.sql`)

#### market_data table
- **Constraint**: `UNIQUE (ticker, data_date)`
- **Purpose**: Ensures each stock ticker can only have one entry per date
- **Example**: Prevents duplicate entries for NVDA on 2025-12-29

#### news_items table
- **Constraint**: `UNIQUE (title, published_date)`
- **Purpose**: Prevents duplicate news articles with the same title on the same date
- **Example**: Ensures an article titled "AI Breakthrough" published on 2025-12-29 is only saved once

### Migration 2: RLS Policies (`configure_rls_policies.sql`)

This migration configures Row Level Security to allow:

#### For Both Tables (market_data, news_items):

**Public Access (Frontend)**:
- ✅ **SELECT** (read) - Anyone can view the data
- ❌ **INSERT/UPDATE/DELETE** - Blocked for anonymous users

**Service Role Access (GitHub Actions)**:
- ✅ **SELECT** - Can read data
- ✅ **INSERT** - Can add new records
- ✅ **UPDATE** - Can modify existing records
- ✅ **DELETE** - Can remove old records

**Why This Matters**:
- Your **frontend** uses the anonymous key and needs SELECT access to display data
- Your **GitHub Actions** use the service role key and need full access to update data
- Without these policies, RLS would block ALL access by default

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
