-- =============================================================================
-- Insider Intel Database Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  cik VARCHAR(10),
  sector VARCHAR(100),
  industry VARCHAR(100),
  market_cap BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_cik ON companies(cik);
CREATE INDEX idx_companies_sector ON companies(sector);

-- Insiders table
CREATE TABLE insiders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cik VARCHAR(10),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insiders_cik ON insiders(cik);
CREATE INDEX idx_insiders_name ON insiders(name);

-- Insider transactions table
CREATE TABLE insider_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insider_id UUID NOT NULL REFERENCES insiders(id) ON DELETE CASCADE,
  accession_number VARCHAR(25) NOT NULL UNIQUE,
  filed_at TIMESTAMPTZ NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type CHAR(1) NOT NULL CHECK (transaction_type IN ('P', 'S', 'A', 'D', 'G', 'M')),
  shares NUMERIC(15, 2),
  price_per_share NUMERIC(12, 4),
  total_value NUMERIC(18, 2),
  shares_owned_after NUMERIC(15, 2),
  insider_title VARCHAR(100),
  is_director BOOLEAN NOT NULL DEFAULT FALSE,
  is_officer BOOLEAN NOT NULL DEFAULT FALSE,
  is_ten_percent_owner BOOLEAN NOT NULL DEFAULT FALSE,
  is_10b5_1_plan BOOLEAN NOT NULL DEFAULT FALSE,
  ai_context TEXT,
  ai_significance_score NUMERIC(3, 2) CHECK (ai_significance_score >= 0 AND ai_significance_score <= 1),
  ai_generated_at TIMESTAMPTZ,
  raw_filing_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insider_transactions_company_id ON insider_transactions(company_id);
CREATE INDEX idx_insider_transactions_insider_id ON insider_transactions(insider_id);
CREATE INDEX idx_insider_transactions_filed_at ON insider_transactions(filed_at DESC);
CREATE INDEX idx_insider_transactions_transaction_date ON insider_transactions(transaction_date DESC);
CREATE INDEX idx_insider_transactions_type ON insider_transactions(transaction_type);

-- Institutions table
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cik VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  institution_type VARCHAR(50),
  aum_estimate BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institutions_name ON institutions(name);
CREATE INDEX idx_institutions_type ON institutions(institution_type);

-- Institutional filings table (13F filings)
CREATE TABLE institutional_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  accession_number VARCHAR(25) NOT NULL UNIQUE,
  report_date DATE NOT NULL,
  filed_at TIMESTAMPTZ NOT NULL,
  total_value BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institutional_filings_institution_id ON institutional_filings(institution_id);
CREATE INDEX idx_institutional_filings_report_date ON institutional_filings(report_date DESC);
CREATE INDEX idx_institutional_filings_filed_at ON institutional_filings(filed_at DESC);

-- Institutional holdings table
CREATE TABLE institutional_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filing_id UUID NOT NULL REFERENCES institutional_filings(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  shares BIGINT NOT NULL,
  value BIGINT NOT NULL,
  percent_of_portfolio NUMERIC(8, 5),
  shares_change BIGINT,
  shares_change_percent NUMERIC(10, 4),
  is_new_position BOOLEAN NOT NULL DEFAULT FALSE,
  is_closed_position BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_institutional_holdings_filing_id ON institutional_holdings(filing_id);
CREATE INDEX idx_institutional_holdings_institution_id ON institutional_holdings(institution_id);
CREATE INDEX idx_institutional_holdings_company_id ON institutional_holdings(company_id);
CREATE INDEX idx_institutional_holdings_report_date ON institutional_holdings(report_date DESC);

-- Unique constraint to prevent duplicate holdings per filing
CREATE UNIQUE INDEX idx_institutional_holdings_unique
  ON institutional_holdings(filing_id, company_id);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  subscription_tier VARCHAR(10) NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'retail', 'pro')),
  stripe_customer_id VARCHAR(255),
  notification_daily_digest BOOLEAN NOT NULL DEFAULT TRUE,
  notification_instant_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  notification_weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Watchlist items table
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_watchlist_items_user_id ON watchlist_items(user_id);
CREATE INDEX idx_watchlist_items_company_id ON watchlist_items(company_id);

-- Unique constraint to prevent duplicate watchlist entries
CREATE UNIQUE INDEX idx_watchlist_items_unique
  ON watchlist_items(user_id, company_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Enable RLS on watchlist_items
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist"
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist"
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for recent insider transactions with company and insider details
CREATE OR REPLACE VIEW v_recent_insider_transactions AS
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
  it.shares_owned_after,
  it.insider_title,
  it.is_director,
  it.is_officer,
  it.is_ten_percent_owner,
  it.is_10b5_1_plan,
  it.ai_context,
  it.ai_significance_score,
  it.ai_generated_at,
  it.raw_filing_url,
  it.created_at,
  c.ticker,
  c.name AS company_name,
  i.name AS insider_name
FROM insider_transactions it
JOIN companies c ON it.company_id = c.id
JOIN insiders i ON it.insider_id = i.id
ORDER BY it.filed_at DESC;

-- View for institutional holdings with company and institution details
CREATE OR REPLACE VIEW v_institutional_holdings AS
SELECT
  ih.id,
  ih.filing_id,
  ih.institution_id,
  ih.company_id,
  ih.report_date,
  ih.shares,
  ih.value,
  ih.percent_of_portfolio,
  ih.shares_change,
  ih.shares_change_percent,
  ih.is_new_position,
  ih.is_closed_position,
  ih.created_at,
  c.ticker,
  c.name AS company_name,
  inst.name AS institution_name,
  inst.institution_type
FROM institutional_holdings ih
JOIN companies c ON ih.company_id = c.id
JOIN institutions inst ON ih.institution_id = inst.id
ORDER BY ih.report_date DESC;

-- =============================================================================
-- GRANTS (for service role access)
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant access to sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
