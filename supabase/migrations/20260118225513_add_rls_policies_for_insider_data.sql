-- Add RLS policies for public read access to SEC filing data
-- These tables contain public SEC information and should be readable by anyone

-- Companies table: allow public read
CREATE POLICY "Allow public read access to companies"
ON public.companies
FOR SELECT
TO anon, authenticated
USING (true);

-- Insiders table: allow public read
CREATE POLICY "Allow public read access to insiders"
ON public.insiders
FOR SELECT
TO anon, authenticated
USING (true);

-- Insider transactions table: allow public read
CREATE POLICY "Allow public read access to insider transactions"
ON public.insider_transactions
FOR SELECT
TO anon, authenticated
USING (true);

-- Also add policies for institutions and related tables for consistency
CREATE POLICY "Allow public read access to institutions"
ON public.institutions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to institutional filings"
ON public.institutional_filings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access to institutional holdings"
ON public.institutional_holdings
FOR SELECT
TO anon, authenticated
USING (true);
