#!/bin/bash
# SEC Form 4 Data Ingestion Script
# Designed to be run via crontab
# Logs output to ~/insider-intel-cron.log

# Set up environment
export PATH="/Users/mattydeighton/.nvm/versions/node/v22.16.0/bin:$PATH"
cd /Users/mattydeighton/Downloads/insider-intel

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Run the seed script with reduced settings for hourly runs
# Only fetch last 2 days and process 200 filings max per run
DAYS_BACK=2 MAX_FILINGS=200 npx tsx scripts/seed-30-days.ts

echo "---"
echo "Completed at: $(date)"
echo "---"
