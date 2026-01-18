# InsiderIntel - External Services Setup Guide

This guide covers **all external services and configurations** required to make InsiderIntel fully functional in production.

> **⚠️ Important**: InsiderIntel requires multiple external services to work. Plan for 2-4 hours for complete setup on your first deployment.

---

## Quick Start Checklist

Before you can run InsiderIntel in production, you must complete **all** of the following:

- [ ] **Database**: Configure Supabase (PostgreSQL + Auth)
- [ ] **Email Confirmation**: Enable email verification in Supabase
- [ ] **AI Service**: Set up Anthropic Claude API
- [ ] **Payments**: Configure Stripe (products, webhooks, customer portal)
- [ ] **Email Service**: Set up Resend with verified domain
- [ ] **Deployment**: Deploy to Vercel with environment variables
- [ ] **Cron Jobs**: Configure scheduled tasks in Vercel
- [ ] **Data Seeding**: Populate database with initial data
- [ ] **Webhooks**: Test Stripe webhooks (use Stripe CLI locally)

**Optional but recommended:**
- [ ] Error tracking with Sentry
- [ ] OpenFIGI API for better CUSIP lookup rates
- [ ] Google OAuth for social login

---

## Table of Contents

1. [Supabase Configuration](#1-supabase-configuration)
2. [Email Confirmation Setup](#2-email-confirmation-setup)
3. [Google OAuth Setup](#3-google-oauth-setup)
4. [Anthropic Claude API](#4-anthropic-claude-api)
5. [Stripe Payments](#5-stripe-payments)
6. [Resend Email Service](#6-resend-email-service)
7. [Vercel Deployment](#7-vercel-deployment)
8. [Vercel Cron Jobs](#8-vercel-cron-jobs)
9. [Data Seeding & Ingestion](#9-data-seeding--ingestion)
10. [OpenFIGI API](#10-openfigi-api)
11. [Sentry Error Tracking](#11-sentry-error-tracking)
12. [Environment Variables Checklist](#12-environment-variables-checklist)
13. [Pre-Deployment Checklist](#13-pre-deployment-checklist)
14. [Post-Deployment Verification](#14-post-deployment-verification)

---

## 1. Supabase Configuration

Supabase provides the PostgreSQL database and authentication for InsiderIntel.

### 1.1 Create Supabase Project

- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create a new project
- [ ] Choose a region close to your users
- [ ] Set a strong database password (save it securely)
- [ ] Wait for project to provision (~2 minutes)

### 1.2 Get API Keys

- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 1.3 Configure Database Schema

Run the following SQL in the **SQL Editor** to create required tables:

```sql
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  notification_daily_digest BOOLEAN DEFAULT false,
  notification_instant_alerts BOOLEAN DEFAULT false,
  notification_weekly_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cik TEXT,
  sector TEXT,
  industry TEXT,
  market_cap BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insiders table
CREATE TABLE IF NOT EXISTS public.insiders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cik)
);

-- Insider transactions table
CREATE TABLE IF NOT EXISTS public.insider_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  insider_id UUID REFERENCES public.insiders(id),
  accession_number TEXT UNIQUE NOT NULL,
  filed_at TIMESTAMPTZ,
  transaction_date DATE,
  transaction_type TEXT,
  shares BIGINT,
  price_per_share NUMERIC,
  total_value NUMERIC,
  insider_title TEXT,
  is_director BOOLEAN DEFAULT false,
  is_officer BOOLEAN DEFAULT false,
  ai_context TEXT,
  ai_significance_score NUMERIC,
  ai_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutions table
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cik TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institution_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Institutional holdings table
CREATE TABLE IF NOT EXISTS public.institutional_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID,
  institution_id UUID REFERENCES public.institutions(id),
  company_id UUID REFERENCES public.companies(id),
  report_date DATE,
  shares BIGINT,
  value BIGINT,
  shares_change BIGINT,
  is_new_position BOOLEAN DEFAULT false,
  is_closed_position BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insider_transactions_company ON public.insider_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_insider_transactions_filed_at ON public.insider_transactions(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON public.companies(ticker);

-- Drop existing views first (required if columns changed)
DROP VIEW IF EXISTS public.v_recent_insider_transactions;
DROP VIEW IF EXISTS public.v_institutional_holdings;

-- View for recent insider transactions with company and insider details
CREATE VIEW public.v_recent_insider_transactions AS
SELECT
  it.id,
  it.company_id,
  it.insider_id,
  it.accession_number,
  it.filed_at,
  it.transaction_date,
  it.transaction_type,
  it.shares,
  it.price_per_share,
  it.total_value,
  it.insider_title,
  it.is_director,
  it.is_officer,
  it.ai_context,
  it.ai_significance_score,
  it.ai_generated_at,
  it.created_at,
  c.ticker,
  c.name AS company_name,
  i.name AS insider_name
FROM public.insider_transactions it
JOIN public.companies c ON it.company_id = c.id
JOIN public.insiders i ON it.insider_id = i.id
ORDER BY it.filed_at DESC;

-- View for institutional holdings with company and institution details
CREATE VIEW public.v_institutional_holdings AS
SELECT
  ih.id,
  ih.filing_id,
  ih.institution_id,
  ih.company_id,
  ih.report_date,
  ih.shares,
  ih.value,
  ih.shares_change,
  ih.is_new_position,
  ih.is_closed_position,
  ih.created_at,
  c.ticker,
  c.name AS company_name,
  inst.name AS institution_name,
  inst.institution_type
FROM public.institutional_holdings ih
JOIN public.companies c ON ih.company_id = c.id
JOIN public.institutions inst ON ih.institution_id = inst.id
ORDER BY ih.report_date DESC;
```

### 1.4 Configure Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Watchlist: Users can manage their own watchlist
CREATE POLICY "Users can view own watchlist" ON public.watchlist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist" ON public.watchlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist" ON public.watchlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Public read access for companies, transactions (no user data)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);

ALTER TABLE public.insider_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view transactions" ON public.insider_transactions FOR SELECT USING (true);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view institutions" ON public.institutions FOR SELECT USING (true);

ALTER TABLE public.institutional_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view holdings" ON public.institutional_holdings FOR SELECT USING (true);
```

### 1.5 Create Profile Trigger

Auto-create a profile when a user signs up:

```sql
-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 1.6 Environment Variables for Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

---

## 2. Email Confirmation Setup

**CRITICAL**: Supabase requires email confirmation for new user signups. Without this, users cannot create accounts.

### 2.1 Configure Email Templates

- [ ] Go to Supabase Dashboard → **Authentication → Email Templates**
- [ ] Configure the following templates:

**Confirm Signup Template:**
- [ ] Subject: `Confirm your email for InsiderIntel`
- [ ] Body: Use the default or customize
- [ ] **CRITICAL**: Ensure `{{ .ConfirmationURL }}` is included in the template
- [ ] Redirect URL: `https://your-domain.com/auth/callback`

**Reset Password Template:**
- [ ] Subject: `Reset your password - InsiderIntel`
- [ ] Body: Customize as needed
- [ ] Ensure `{{ .ConfirmationURL }}` is included

**Magic Link Template (if using):**
- [ ] Subject: `Your magic link for InsiderIntel`
- [ ] Body: Customize as needed

### 2.2 Configure Email Auth Settings

- [ ] Go to **Authentication → Providers → Email**
- [ ] Ensure **Email** provider is enabled
- [ ] Settings to configure:
  - [ ] **Confirm email**: Enable (required for production)
  - [ ] **Secure email change**: Enable (recommended)
  - [ ] **Double confirm email changes**: Enable (recommended)

### 2.3 Configure Email Rate Limiting

To prevent abuse:

- [ ] Go to **Authentication → Rate Limits**
- [ ] Set appropriate limits:
  - Email sent per hour: 4 (default)
  - SMS sent per hour: 4 (default)

### 2.4 Test Email Confirmation

1. [ ] Create a test account with a real email address you can access
2. [ ] Check your inbox for confirmation email
3. [ ] Click confirmation link
4. [ ] Verify redirect to `/auth/callback` then `/dashboard`
5. [ ] Check Supabase Auth → Users - user should be confirmed

### 2.5 Troubleshooting Email Confirmation

**Emails not sending?**
- Supabase uses their own SMTP server by default (free tier)
- Check **Authentication → Email Templates → Configuration** for delivery issues
- For production, consider using a custom SMTP provider (see Supabase docs)

**Confirmation link not working?**
- Verify **Site URL** is set correctly in Supabase
- Check **Redirect URLs** include your auth callback
- Ensure middleware allows `/auth/callback` route

**Users can't sign in after confirming?**
- Check database: `auth.users` table - `email_confirmed_at` should be set
- Verify RLS policies don't block confirmed users
- Check browser console for errors

---

## 3. Google OAuth Setup

Google OAuth is configured through Supabase for "Sign in with Google" functionality.

### 3.1 Create Google Cloud Project

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create a new project (or select existing)
- [ ] Enable the **Google+ API** (or **Google Identity Services**)

### 3.2 Configure OAuth Consent Screen

- [ ] Go to **APIs & Services → OAuth consent screen**
- [ ] Choose **External** user type
- [ ] Fill in app information:
  - App name: `InsiderIntel`
  - User support email: your email
  - App logo: (optional)
  - App domain: `https://insiderintel.com`
  - Authorized domains: `insiderintel.com`, `supabase.co`
  - Developer contact: your email
- [ ] Add scopes: `email`, `profile`, `openid`
- [ ] Add test users (if in testing mode)
- [ ] Save and continue

### 3.3 Create OAuth Credentials

- [ ] Go to **APIs & Services → Credentials**
- [ ] Click **Create Credentials → OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name: `InsiderIntel Supabase`
- [ ] Add **Authorized JavaScript origins**:
  - `https://your-project.supabase.co`
- [ ] Add **Authorized redirect URIs**:
  - `https://your-project.supabase.co/auth/v1/callback`
- [ ] Click **Create**
- [ ] Copy **Client ID** and **Client Secret**

### 3.4 Configure Supabase Auth Provider

- [ ] Go to Supabase Dashboard → **Authentication → Providers**
- [ ] Find **Google** and enable it
- [ ] Paste your **Client ID**
- [ ] Paste your **Client Secret**
- [ ] Save

### 3.5 Configure Redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

- [ ] Set **Site URL**: `https://insiderintel.com`
- [ ] Add **Redirect URLs**:
  - `https://insiderintel.com/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### 3.6 Verify Setup

1. [ ] Start your dev server
2. [ ] Click "Sign in with Google" on login page
3. [ ] Complete Google OAuth flow
4. [ ] Verify redirect to `/dashboard`
5. [ ] Check `profiles` table for new user

---

## 4. Anthropic Claude API

Claude AI generates contextual analysis for insider transactions.

### 5.1 Create Anthropic Account

- [ ] Sign up at [console.anthropic.com](https://console.anthropic.com)
- [ ] Complete account verification
- [ ] Add payment method (usage-based billing)

### 5.2 Get API Key

- [ ] Go to **API Keys** in the console
- [ ] Click **Create Key**
- [ ] Name: `InsiderIntel Production`
- [ ] Copy the key (starts with `sk-ant-`)
- [ ] Add to environment: `ANTHROPIC_API_KEY`

### 5.3 Usage Information

**Model used:** `claude-3-5-sonnet-20241022`

**Features:**
- Generates contextual analysis for insider transactions
- Produces significance scores (0.0 - 1.0)
- Batch processing with concurrency control
- Company-level aggregate insights

**Rate limiting (built-in):**
- 100ms delay between requests
- Max 5 concurrent API calls
- Exponential backoff on errors

**Cost considerations:**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Each transaction analysis uses ~500-1000 tokens

### 5.4 Environment Variables for Anthropic

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

---

## 5. Stripe Payments

### 5.1 Create Stripe Account

- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Complete business verification
- [ ] Enable test mode for development

### 5.2 Create Products and Prices

In the Stripe Dashboard, create subscription products:

**Retail Plan ($19/month)**
- [ ] Go to Products → Add Product
- [ ] Name: "Retail Plan"
- [ ] Description: "Perfect for active individual investors"
- [ ] Add Price: $19.00 USD, Recurring, Monthly
- [ ] Copy the Price ID (starts with `price_`)

**Pro Plan ($49/month)**
- [ ] Go to Products → Add Product
- [ ] Name: "Pro Plan"
- [ ] Description: "For professionals who need comprehensive data"
- [ ] Add Price: $49.00 USD, Recurring, Monthly
- [ ] Copy the Price ID (starts with `price_`)

### 6.3 Get API Keys

- [ ] Go to Developers → API Keys
- [ ] Copy **Secret key** (starts with `sk_test_` or `sk_live_`)
- [ ] Add to environment: `STRIPE_SECRET_KEY`

### 5.4 Configure Webhook

- [ ] Go to Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://your-domain.com/api/stripe/webhook`
- [ ] Select events to listen to:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- [ ] Click "Add endpoint"
- [ ] Copy **Signing secret** (starts with `whsec_`)
- [ ] Add to environment: `STRIPE_WEBHOOK_SECRET`

### 5.5 Configure Customer Portal

- [ ] Go to Settings → Billing → Customer Portal
- [ ] Enable the customer portal
- [ ] Configure allowed actions:
  - [ ] Allow customers to update payment methods
  - [ ] Allow customers to view invoice history
  - [ ] Allow customers to cancel subscriptions
- [ ] Set cancellation options (immediate or end of period)
- [ ] Save changes

### 5.6 Environment Variables for Stripe

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

---

## 6. Resend Email Service

### 6.1 Create Resend Account

- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your email address

### 6.2 Add and Verify Domain

- [ ] Go to Domains → Add Domain
- [ ] Enter your domain (e.g., `insiderintel.com`)
- [ ] Add the DNS records provided:
  - [ ] SPF record (TXT)
  - [ ] DKIM record (TXT)
  - [ ] DMARC record (TXT) - optional but recommended
- [ ] Wait for domain verification (can take up to 48 hours)

### 6.3 Get API Key

- [ ] Go to API Keys → Create API Key
- [ ] Name: "InsiderIntel Production"
- [ ] Permissions: Full access (or Sending access only)
- [ ] Copy the API key (starts with `re_`)
- [ ] Add to environment: `RESEND_API_KEY`

### 6.4 Configure From Address

Choose a from address using your verified domain:
- Recommended: `notifications@insiderintel.com`
- Alternative: `noreply@insiderintel.com`

### 6.5 Environment Variables for Resend

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>
```

---

## 7. Vercel Deployment

**CRITICAL**: You must deploy to Vercel to enable cron jobs and production environment variables.

### 7.1 Create Vercel Account

- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Connect your GitHub/GitLab/Bitbucket account
- [ ] Install Vercel app to your repository

### 7.2 Import Project

- [ ] Go to Vercel Dashboard
- [ ] Click **"Add New..." → Project**
- [ ] Select your InsiderIntel repository
- [ ] Click **Import**

### 7.3 Configure Project Settings

**Framework Preset**: Next.js (should auto-detect)
**Root Directory**: `./` (leave default)
**Build Command**: `npm run build` (default)
**Output Directory**: `.next` (default)
**Install Command**: `npm install` (default)

### 7.4 Set Environment Variables

**CRITICAL**: Add ALL required environment variables before deploying.

- [ ] Go to **Project Settings → Environment Variables**
- [ ] Add each variable from the [Environment Variables Checklist](#12-environment-variables-checklist)
- [ ] **Important**: Set appropriate environment scopes:
  - Production: for live deployment
  - Preview: for pull request previews
  - Development: for local development (optional)

**Required variables (minimum):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_RETAIL_PRICE_ID
STRIPE_PRO_PRICE_ID
RESEND_API_KEY
EMAIL_FROM
CRON_SECRET
NEXT_PUBLIC_APP_URL
```

### 7.5 Deploy

- [ ] Click **Deploy**
- [ ] Wait for build to complete (~5-10 minutes)
- [ ] Verify deployment succeeds
- [ ] Copy your deployment URL (e.g., `your-project.vercel.app`)

### 7.6 Configure Custom Domain (Optional)

- [ ] Go to **Project Settings → Domains**
- [ ] Add your custom domain (e.g., `insiderintel.com`)
- [ ] Follow DNS configuration instructions:
  - For root domain: Add A record
  - For www subdomain: Add CNAME record
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify SSL certificate is issued

### 7.7 Update External Services with Production URL

After deployment, update these services with your production URL:

- [ ] **Supabase**: Update Site URL and Redirect URLs
- [ ] **Google OAuth**: Update Authorized redirect URIs
- [ ] **Stripe**: Update webhook endpoint URL
- [ ] **Environment Variables**: Update `NEXT_PUBLIC_APP_URL` to your domain

### 7.8 Verify Production Deployment

1. [ ] Visit your production URL
2. [ ] Landing page loads correctly
3. [ ] Sign up for a new account
4. [ ] Receive confirmation email
5. [ ] Confirm email and sign in
6. [ ] Dashboard loads (may show "Database Not Set Up" - this is expected if no data)

---

## 8. Vercel Cron Jobs

**Note**: Cron jobs only work in production deployments on Vercel.

### 8.1 Configure Cron Jobs in vercel.json

The `vercel.json` file in your project root defines cron schedules:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-daily-digest",
      "schedule": "0 13 * * *"
    },
    {
      "path": "/api/cron/send-weekly-summary",
      "schedule": "0 14 * * 1"
    },
    {
      "path": "/api/cron/generate-context",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Schedule explanations:**
- Daily digest: 1:00 PM UTC (8:00 AM EST) every day
- Weekly summary: 2:00 PM UTC (9:00 AM EST) every Monday
- AI context generation: Every 6 hours

### 8.2 Secure Cron Endpoints

**CRITICAL**: Cron endpoints must be secured to prevent unauthorized access.

- [ ] Generate a secure random string for `CRON_SECRET`:
  ```bash
  openssl rand -hex 32
  ```
- [ ] Add to Vercel environment variables
- [ ] Vercel automatically sends this in the `Authorization: Bearer <CRON_SECRET>` header
- [ ] Your cron routes verify this header (already implemented in code)

### 8.3 Verify Cron Jobs

After deploying to production:

1. [ ] Go to Vercel Dashboard → **Your Project → Cron Jobs**
2. [ ] Verify all 3 cron jobs are listed
3. [ ] Check next execution time
4. [ ] Monitor first execution in **Deployments → Functions** logs
5. [ ] Manually trigger a cron job to test (optional):
   ```bash
   curl -X GET https://your-domain.com/api/cron/send-daily-digest \
     -H "Authorization: Bearer your-cron-secret"
   ```

### 8.4 Environment Variables for Cron

```env
CRON_SECRET=your-secure-random-string-from-openssl
INTERNAL_API_SECRET=another-secure-random-string
```

---

## 9. Data Seeding & Ingestion

**CRITICAL**: The application will show "Database Not Set Up" errors until you populate the database with data.

### 9.1 Why You Need Data

InsiderIntel requires the following data to function:

- **Companies table**: List of publicly traded companies with tickers
- **Insider transactions**: SEC Form 4 filings data
- **Institutional holdings**: 13F filings data (optional)

**Without this data, the dashboard will be empty or show errors.**

### 9.2 Data Seeding Options

You have several options for populating your database:

#### Option A: Sample Data Seed Script (Quickest for Testing)

Use the provided seed script to add sample data:

```bash
# In your project directory
npm run seed
```

This populates:
- ~50 sample companies (major S&P 500 stocks)
- ~200 sample insider transactions
- Sample institutional holdings

**Note**: This is mock data for testing only, not real SEC filings.

#### Option B: Manual Data Entry (For Testing)

Add a few companies and transactions manually via Supabase SQL Editor:

```sql
-- Add a test company
INSERT INTO public.companies (ticker, name, sector, market_cap)
VALUES ('AAPL', 'Apple Inc.', 'Technology', 3000000000000);

-- Add a test insider
INSERT INTO public.insiders (cik, name)
VALUES ('0001234567', 'Tim Cook');

-- Add a test transaction
INSERT INTO public.insider_transactions (
  company_id,
  insider_id,
  accession_number,
  filed_at,
  transaction_date,
  transaction_type,
  shares,
  price_per_share,
  total_value,
  insider_title
)
SELECT
  c.id,
  i.id,
  '0001234567-24-000001',
  NOW(),
  CURRENT_DATE,
  'P',
  10000,
  175.50,
  1755000,
  'CEO'
FROM public.companies c
CROSS JOIN public.insiders i
WHERE c.ticker = 'AAPL' AND i.name = 'Tim Cook';
```

#### Option C: SEC EDGAR Data Ingestion (Production)

For production use with real data, you need to:

1. **Implement SEC EDGAR scraper** (not currently included in codebase):
   - Fetch Form 4 filings from SEC EDGAR API
   - Parse XML/HTML filing data
   - Extract company, insider, and transaction details
   - Store in database

2. **Set up recurring ingestion**:
   - Create a cron job to fetch new filings daily
   - Recommended: Use a separate service/worker for this
   - SEC EDGAR provides real-time feeds and bulk downloads

3. **Optional**: Use a third-party SEC data provider:
   - Consider paid services like Quiver Quantitative, Alpha Vantage, or similar
   - These provide cleaned, structured SEC filing data via API
   - May include Form 4 and 13F data

### 9.3 Verify Data Population

After seeding, verify in Supabase:

```sql
-- Check companies
SELECT COUNT(*) FROM public.companies;

-- Check transactions
SELECT COUNT(*) FROM public.insider_transactions;

-- Check the view works
SELECT * FROM public.v_recent_insider_transactions LIMIT 10;
```

Visit your application:
- [ ] Dashboard should now show data instead of "Database Not Set Up"
- [ ] Insider Trades page should list transactions
- [ ] Company search should find tickers

### 9.4 AI Context Generation

After populating transaction data, generate AI context:

1. [ ] Manually trigger the cron job:
   ```bash
   curl -X GET https://your-domain.com/api/cron/generate-context \
     -H "Authorization: Bearer your-cron-secret"
   ```

2. [ ] Verify `ai_context` and `ai_significance_score` fields are populated:
   ```sql
   SELECT
     ticker,
     insider_name,
     transaction_type,
     ai_significance_score,
     LEFT(ai_context, 100) as context_preview
   FROM public.v_recent_insider_transactions
   WHERE ai_context IS NOT NULL
   LIMIT 10;
   ```

3. [ ] Note: This uses Anthropic API credits based on number of transactions

---

## 10. OpenFIGI API

OpenFIGI provides CUSIP to ticker symbol mapping for 13F institutional holdings data.

### 10.1 Create OpenFIGI Account (Optional but Recommended)

The API works without an account, but with lower rate limits.

**Without API key:**
- 25 requests per minute
- 5 CUSIP lookups per request

**With API key (free):**
- 250 requests per minute
- 100 CUSIP lookups per request

### 10.2 Get API Key

- [ ] Go to [openfigi.com/api](https://www.openfigi.com/api)
- [ ] Click "Get API Key"
- [ ] Create a free account
- [ ] Copy your API key
- [ ] Add to environment: `OPENFIGI_API_KEY`

### 10.3 Environment Variables for OpenFIGI

```env
# Optional but recommended for better rate limits
OPENFIGI_API_KEY=your-api-key-here
```

### 10.4 How It Works

The system uses a multi-layer approach for CUSIP to ticker mapping:

1. **Hardcoded fallback** - ~60 common securities for instant lookup
2. **OpenFIGI API** - Dynamic lookup for unknown CUSIPs
3. **In-memory cache** - 7-day TTL to minimize API calls

---

## 11. Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring.

### 11.1 Create Sentry Account

- [ ] Sign up at [sentry.io](https://sentry.io)
- [ ] Create a new organization (or use existing)
- [ ] Create a new project with platform: **Next.js**

### 11.2 Get Project DSN

- [ ] Go to **Settings → Projects → [Your Project] → Client Keys (DSN)**
- [ ] Copy the DSN (looks like `https://xxx@xxx.ingest.sentry.io/xxx`)
- [ ] Add to environment: `NEXT_PUBLIC_SENTRY_DSN`

### 11.3 Configure Source Maps (Optional - for CI/CD)

For better stack traces in production:

- [ ] Go to **Settings → Auth Tokens**
- [ ] Create a new token with `project:releases` and `org:read` scopes
- [ ] Add to CI environment: `SENTRY_AUTH_TOKEN`
- [ ] Add organization slug: `SENTRY_ORG`
- [ ] Add project slug: `SENTRY_PROJECT`

### 11.4 Environment Variables for Sentry

```env
# Required
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional - for source map uploads
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

### 11.5 Features Included

- **Client-side error tracking** - Catches React errors, unhandled rejections
- **Server-side error tracking** - API route errors, server component errors
- **Session Replay** - Record user sessions for debugging (10% sample in prod)
- **Performance monitoring** - Track slow transactions (10% sample in prod)
- **Cron job monitoring** - Automatic Vercel cron monitoring

### 11.6 Verify Setup

1. [ ] Deploy to production
2. [ ] Trigger a test error (e.g., visit `/debug-sentry` in development)
3. [ ] Check Sentry dashboard for the error
4. [ ] Verify source maps are working (stack traces show original code)

---

## 12. Environment Variables Checklist

### Required for Production

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Yes |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | Yes |
| `STRIPE_RETAIL_PRICE_ID` | Stripe Products | Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe Products | Yes |
| `RESEND_API_KEY` | Resend Dashboard | Yes |
| `EMAIL_FROM` | Your verified domain | Yes |
| `CRON_SECRET` | Self-generated | Yes |
| `NEXT_PUBLIC_APP_URL` | Your domain | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Console | Yes |

### Optional

| Variable | Source | Purpose |
|----------|--------|---------|
| `OPENFIGI_API_KEY` | OpenFIGI Dashboard | Higher rate limits for CUSIP lookups |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Dashboard | Error tracking |
| `SENTRY_ORG` | Sentry Dashboard | Source map uploads |
| `SENTRY_PROJECT` | Sentry Dashboard | Source map uploads |
| `SENTRY_AUTH_TOKEN` | Sentry Dashboard | Source map uploads |
| `LOG_LEVEL` | N/A | Override default log level |

### Complete .env.local Template

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_RETAIL_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=InsiderIntel <notifications@insiderintel.com>

# Cron/Internal API Security
CRON_SECRET=your-secure-random-string
INTERNAL_API_SECRET=another-secure-random-string

# OpenFIGI API (optional - for better rate limits)
OPENFIGI_API_KEY=your-api-key-here

# Sentry Error Tracking (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Application Configuration
NEXT_PUBLIC_APP_URL=https://insiderintel.com
```

---

## 13. Pre-Deployment Checklist

Before deploying to production, verify you have completed ALL of these steps:

### Database Configuration
- [ ] Supabase project created and provisioned
- [ ] Database schema created (all tables, views, RLS policies)
- [ ] Profile trigger function created
- [ ] Row Level Security enabled and tested
- [ ] Sample data seeded (at minimum for testing)
- [ ] Database views returning data correctly

### Authentication
- [ ] Email confirmation enabled in Supabase
- [ ] Email templates configured (signup, reset password)
- [ ] Site URL set correctly in Supabase
- [ ] Redirect URLs configured (include `/auth/callback`)
- [ ] Test account created and email confirmed successfully
- [ ] Google OAuth configured (if using social login)

### Payment Processing
- [ ] Stripe account created
- [ ] Products created (Retail $19/mo, Pro $49/mo)
- [ ] Price IDs copied to environment variables
- [ ] Webhook endpoint configured with correct URL
- [ ] Webhook signing secret saved
- [ ] Customer portal enabled and configured
- [ ] Test payment completed successfully (use test mode first)

### Email Service
- [ ] Resend account created
- [ ] Domain added and verified (DNS records)
- [ ] API key generated
- [ ] FROM address configured
- [ ] Test email sent successfully

### AI Service
- [ ] Anthropic account created with payment method
- [ ] API key generated
- [ ] Test API call successful (verify credit usage)

### Deployment Platform
- [ ] Vercel account connected to repository
- [ ] Project imported
- [ ] ALL environment variables set in Vercel
- [ ] Production domain configured (if using custom domain)
- [ ] DNS configured and verified
- [ ] Initial deployment successful

### Cron Jobs
- [ ] `vercel.json` with cron configuration in repository
- [ ] `CRON_SECRET` generated and set in environment variables
- [ ] Cron jobs visible in Vercel dashboard after deployment

### Testing & Monitoring
- [ ] Sentry project created (optional but recommended)
- [ ] Sentry DSN configured
- [ ] Test error sent to Sentry successfully

### Final Verification
- [ ] All required environment variables set
- [ ] Application loads without errors
- [ ] Can create account and confirm email
- [ ] Can sign in and access dashboard
- [ ] Database shows data (transactions, companies)
- [ ] Search works
- [ ] Upgrade flow works (test mode)
- [ ] Emails send successfully

**DO NOT deploy to production until ALL items are checked!**

---

## 14. Post-Deployment Verification

After deploying to production, systematically test all functionality:

### 1. Landing Page & Public Routes

- [ ] Visit landing page: `https://your-domain.com`
- [ ] All sections load correctly
- [ ] No console errors
- [ ] Images load
- [ ] Pricing information displays correctly
- [ ] "Start Free" button navigates to signup

### 2. Authentication Flow

**Sign Up:**
- [ ] Navigate to `/signup`
- [ ] Create new account with real email
- [ ] Receive confirmation email (check spam if not in inbox)
- [ ] Click confirmation link
- [ ] Redirected to `/auth/callback` then `/dashboard`
- [ ] Profile created in database with correct default values

**Sign In:**
- [ ] Log out
- [ ] Navigate to `/login`
- [ ] Sign in with credentials
- [ ] Redirected to `/dashboard`

**Password Reset:**
- [ ] Click "Forgot password?"
- [ ] Enter email and submit
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Can sign in with new password

**Google OAuth** (if configured):
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth flow
- [ ] Redirected to dashboard
- [ ] Profile created with Google data

### 3. Dashboard Functionality

- [ ] Dashboard loads without errors
- [ ] Metrics cards show correct counts
- [ ] Recent transactions table displays data
- [ ] Cluster alerts appear (if any)
- [ ] Watchlist activity shows (if items in watchlist)
- [ ] No "Database Not Set Up" error (if data is seeded)

### 4. Data Tables & Search

**Insider Trades:**
- [ ] Navigate to `/insider-trades`
- [ ] Transaction table loads with data
- [ ] Filters work (type, date range, significance)
- [ ] Pagination works
- [ ] Row expansion shows AI context
- [ ] "Export CSV" button present (may not work without implementation)

**Institutions:**
- [ ] Navigate to `/institutions`
- [ ] Tabs switch correctly
- [ ] Holdings data displays
- [ ] Filters work

**Search:**
- [ ] Header search bar works
- [ ] Type a ticker (e.g., "AAPL")
- [ ] Autocomplete suggestions appear
- [ ] Click result navigates to company page
- [ ] "No results" message for invalid ticker

### 5. Company Detail Pages

- [ ] Click any ticker to visit company page
- [ ] Company header displays correctly
- [ ] Metrics cards show 1Y stats
- [ ] Tabs work (Overview, Insider Activity, Institutional Holdings)
- [ ] Charts render
- [ ] "Add to Watchlist" button works

### 6. Watchlist

- [ ] Navigate to `/watchlist`
- [ ] Add a company to watchlist
- [ ] Company card appears
- [ ] Remove company works
- [ ] Activity feed updates
- [ ] Empty state shows when watchlist is empty

### 7. Settings Pages

**Profile:**
- [ ] Navigate to `/settings/profile`
- [ ] Name field shows current value
- [ ] Can update name
- [ ] Success message appears
- [ ] Database updates

**Notifications:**
- [ ] Navigate to `/settings/notifications`
- [ ] Toggle switches work
- [ ] Preferences save correctly
- [ ] Database updates

**Billing:**
- [ ] Navigate to `/settings/billing`
- [ ] Current plan displays correctly
- [ ] Plan cards show features
- [ ] "Upgrade to Retail" button present
- [ ] Click redirects to Stripe Checkout

### 8. Stripe Integration

**Checkout Flow** (TEST MODE FIRST):
- [ ] Click "Upgrade to Retail" on billing page
- [ ] Redirected to Stripe Checkout
- [ ] Form shows correct plan and price
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Redirected back to application
- [ ] Database: `subscription_tier` updated to 'retail'
- [ ] Database: `stripe_customer_id` populated
- [ ] Billing page shows new plan

**Customer Portal:**
- [ ] Click "Manage Billing" on billing page
- [ ] Redirected to Stripe Customer Portal
- [ ] Can view invoices
- [ ] Can update payment method
- [ ] Can cancel subscription

**Webhook Delivery:**
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Check recent events
- [ ] Verify `checkout.session.completed` was delivered
- [ ] Check response was 200 OK
- [ ] If errors, check logs in Vercel

### 9. Email Functionality

**Manual Test:**
- [ ] Enable "Daily Digest" in notification settings
- [ ] Manually trigger cron:
  ```bash
  curl -X GET https://your-domain.com/api/cron/send-daily-digest \
    -H "Authorization: Bearer your-cron-secret"
  ```
- [ ] Check email inbox
- [ ] Verify email received with correct branding
- [ ] Links in email work correctly

**Resend Dashboard:**
- [ ] Go to Resend Dashboard → Logs
- [ ] Verify email was sent
- [ ] Check delivery status (Delivered, not Bounced)

### 10. Cron Jobs

- [ ] Go to Vercel Dashboard → Your Project → Cron Jobs
- [ ] Verify all 3 cron jobs listed:
  - `send-daily-digest` (daily at 13:00 UTC)
  - `send-weekly-summary` (weekly Monday 14:00 UTC)
  - `generate-context` (every 6 hours)
- [ ] Check "Next Run" times are correct
- [ ] Wait for first execution or manually trigger
- [ ] Check Vercel logs for execution success
- [ ] Verify cron routes return 200 status

### 11. AI Context Generation

- [ ] Ensure transactions exist in database
- [ ] Manually trigger:
  ```bash
  curl -X GET https://your-domain.com/api/cron/generate-context \
    -H "Authorization: Bearer your-cron-secret"
  ```
- [ ] Check Vercel logs for AI API calls
- [ ] Verify database: `ai_context` and `ai_significance_score` fields populated
- [ ] Check transaction table shows significance badges
- [ ] Verify Anthropic dashboard for usage/costs

### 12. Error Tracking (Sentry)

If you configured Sentry:

- [ ] Visit a page that doesn't exist (e.g., `/nonexistent-page`)
- [ ] Go to Sentry Dashboard
- [ ] Verify error was captured
- [ ] Check stack trace shows correct file/line
- [ ] Verify source maps working (original code visible, not compiled)

### 13. Performance & Monitoring

- [ ] Open browser DevTools → Network tab
- [ ] Navigate through app pages
- [ ] Check all API calls return 200 status
- [ ] Check page load times (should be under 3 seconds)
- [ ] Check for console errors or warnings
- [ ] Verify no 404s or 500s in network tab

### 14. Mobile Responsiveness

- [ ] Open site on mobile device or use DevTools mobile emulation
- [ ] Test at 375px width (iPhone SE)
- [ ] Sidebar collapses to hamburger menu
- [ ] Tables scroll horizontally
- [ ] Forms are usable
- [ ] Buttons have adequate touch targets

### 15. Accessibility

- [ ] Tab through pages with keyboard only
- [ ] Verify focus rings are visible
- [ ] Test ⌘K/Ctrl+K command palette
- [ ] Arrow keys navigate search results
- [ ] Screen reader announces page changes (optional - use NVDA/VoiceOver)

---

## Troubleshooting

### "Database Not Set Up" Error

**Symptoms**: Dashboard shows amber database icon with setup instructions

**Causes**:
- Database views don't exist
- No data in `companies` or `insider_transactions` tables
- RLS policies blocking data access

**Solutions**:
1. Verify views exist:
   ```sql
   SELECT * FROM public.v_recent_insider_transactions LIMIT 1;
   ```
2. Check data exists:
   ```sql
   SELECT COUNT(*) FROM public.companies;
   SELECT COUNT(*) FROM public.insider_transactions;
   ```
3. If counts are 0, run seed script or populate data manually
4. Check RLS policies aren't blocking reads (views should have `SELECT` policy with `USING (true)`)

### Stripe Webhook Not Receiving Events

**Symptoms**: Subscription tier doesn't update after checkout

**Solutions**:
- Verify webhook URL is publicly accessible (not `localhost`)
- Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET` env var
- Go to Stripe Dashboard → Webhooks → Event Logs
- Look for failed events with 4xx/5xx responses
- Check Vercel function logs for errors
- Ensure webhook listens to required events (see [Stripe setup](#5-stripe-payments))

### Emails Not Sending

**Symptoms**: Confirmation emails or digests not received

**Solutions**:
- Check spam/junk folder
- Verify domain is fully verified in Resend (green checkmark)
- Go to Resend Dashboard → Logs
- Check for bounces or failures
- Verify `EMAIL_FROM` uses verified domain
- Check `RESEND_API_KEY` is correct
- Test with `curl` directly to cron endpoint

### Cron Jobs Not Running

**Symptoms**: Cron jobs don't appear in Vercel dashboard

**Solutions**:
- Ensure `vercel.json` is in **root** of repository (not `/src` or subdirectory)
- Re-deploy after adding/modifying `vercel.json`
- Check Vercel deployment logs for cron configuration messages
- Verify `CRON_SECRET` matches between env vars and code

**Symptoms**: Cron jobs listed but not executing

**Solutions**:
- Check Vercel logs during scheduled execution time
- Manually trigger to test:
  ```bash
  curl -X GET https://your-domain.com/api/cron/send-daily-digest \
    -H "Authorization: Bearer your-actual-cron-secret"
  ```
- Verify response is 200, not 401 (auth failure) or 500 (server error)
- Check function timeout isn't being exceeded (default: 10s, max varies by plan)

### AI Context Generation Failing

**Symptoms**: `ai_context` and `ai_significance_score` remain null

**Solutions**:
- Check Anthropic API key is valid
- Verify Anthropic account has credits/payment method
- Check Vercel logs for AI API errors
- Rate limit may be hit - check Anthropic dashboard
- Verify transactions have required fields (ticker, insider_name, transaction_type)

### OAuth Redirect Issues

**Symptoms**: Google OAuth fails or loops

**Solutions**:
- Verify redirect URI in Google Console exactly matches Supabase callback URL
- Check Site URL in Supabase matches your production domain
- Ensure `https://` (not `http://`) is used in production
- Check middleware allows `/auth/callback` route

### Search Not Working

**Symptoms**: Header search returns no results

**Solutions**:
- Verify companies table has data
- Check API endpoint: `GET /api/search?q=AAPL`
- Should return JSON with results array
- Check Supabase RLS allows SELECT on companies table
- Verify search uses case-insensitive matching (`.ilike()`)

### Page Load Errors / 500 Status

**Symptoms**: Pages show error screen or won't load

**Solutions**:
- Check Vercel function logs (Deployments → Functions → View logs)
- Look for error stack traces
- Check Sentry for captured errors (if configured)
- Verify all required environment variables are set
- Check Supabase connection (DB may be paused on free tier after inactivity)

---

*Last updated: January 18, 2026*
