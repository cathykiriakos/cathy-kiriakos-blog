# Market Data Setup Guide

## Current Issue

You're seeing **$0.00T** for AI Companies Market Cap and Chip Makers Market Cap on the Market Intelligence page. This indicates that **no market data exists in your Supabase database yet**.

## Why This Is Happening

The market data is populated by a GitHub Action that runs automatically every day at **9 AM UTC**. The Action:
1. Fetches stock data from Alpha Vantage API for 14 AI/chip companies
2. Fetches AI news from NewsAPI, NYT, and NPR
3. Stores all data in your Supabase database
4. Generates a daily digest markdown file

However, the Action may not have run yet, or may need to be triggered manually for the first time.

## Solution: Trigger the GitHub Action Manually

### Step 1: Go to GitHub Actions

1. Visit your repository: https://github.com/cathykiriakos/cathy-kiriakos-blog
2. Click the **Actions** tab at the top
3. Find the workflow named **"Daily Market & News Update"** in the left sidebar

### Step 2: Run the Workflow

1. Click on "Daily Market & News Update"
2. Click the **"Run workflow"** button (on the right side)
3. Select branch: `main`
4. Click **"Run workflow"** to confirm

### Step 3: Monitor the Run

The workflow will take approximately **5-10 minutes** to complete (due to API rate limits). You can watch the progress:

1. Click on the running workflow (yellow circle icon)
2. Expand each step to see detailed logs
3. Wait for all steps to complete (green checkmarks)

## What Data Will Be Populated

### Market Data (14 Companies)
**AI Companies:**
- Microsoft (MSFT)
- Google/Alphabet (GOOGL)
- Meta (META)
- Amazon (AMZN)
- Apple (AAPL)
- Oracle (ORCL)

**Chip Makers:**
- NVIDIA (NVDA)
- AMD (AMD)
- Intel (INTC)
- TSMC (TSM)
- Broadcom (AVGO)
- Qualcomm (QCOM)
- ARM Holdings (ARM)

**Infrastructure:**
- Snowflake (SNOW)

### News Items
- Latest AI and technology news from multiple sources
- Sentiment analysis (positive/neutral/negative)
- Published dates and summaries

## Verifying the Data

### Option 1: Check Supabase Directly

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Check these tables:
   - `market_data` - Should show 14 rows with today's date
   - `news_items` - Should show recent AI news articles

### Option 2: Check the Market Intelligence Page

1. Visit: https://cathy-kiriakos.lovable.app/market-intelligence
2. Click the **"Refresh Data"** button
3. You should see:
   - AI Companies Market Cap: $X.XXT (in trillions)
   - Chip Makers Market Cap: $X.XXT
   - Market Sentiment: XX%
   - List of companies with stock prices and changes
   - Recent AI news articles

## Troubleshooting

### If the Action Fails

Check the workflow logs for these common issues:

1. **API Rate Limits**
   - Alpha Vantage free tier: 5 calls/minute, 500 calls/day
   - The script includes delays to respect these limits

2. **Missing API Keys**
   - Verify these secrets are set in GitHub: Settings → Secrets → Actions
   - `ALPHA_VANTAGE_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `NEWS_API_KEY`
   - `NYT_API_KEY` (optional)
   - `NPR_API_KEY` (optional)

3. **Database Permissions**
   - The unique constraint migration should be applied (see `supabase/migrations/add_unique_constraints.sql`)
   - RLS policies should allow service key access

### If Data Exists But Doesn't Show on Page

1. **Check Browser Console** for JavaScript errors
2. **Hard Refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear Cache** and reload
4. **Check Network Tab** to see if API calls are succeeding

## Expected Results

After running the GitHub Action successfully, you should see:

### Market Intelligence Page
- **AI Companies Market Cap**: ~$10-15T (varies with market)
- **Chip Makers Market Cap**: ~$3-5T (varies with market)
- **Market Sentiment**: 50-80% (based on news sentiment)
- **14 company cards** with current stock prices and daily changes
- **Recent news articles** about AI with sentiment tags

### Daily Digest File
A new markdown file will be created in `daily-digests/daily-digest-YYYY-MM-DD.md` containing:
- Market summary
- Company rankings
- Sentiment analysis
- News highlights

## Maintenance

Once set up, the GitHub Action will run automatically every day at 9 AM UTC. You can:

1. **Monitor runs**: Check the Actions tab for daily execution logs
2. **Manual triggers**: Run the workflow anytime for immediate updates
3. **Review digests**: Check the `daily-digests/` folder for daily summaries

## Quick Reference

| Item | Value |
|------|-------|
| Workflow Schedule | 9 AM UTC daily |
| Companies Tracked | 14 (6 AI, 7 chip, 1 infrastructure) |
| Data Refresh | Every 5 minutes on the page |
| News Refresh | Every 15 minutes on the page |
| Rate Limit | 5 API calls/minute (Alpha Vantage) |

## Need Help?

If you continue to see $0.00T after running the Action:

1. Check the workflow logs for errors
2. Verify Supabase tables have data
3. Check browser console for fetch errors
4. Ensure you've deployed the latest code to Lovable (the code with improved error handling)
