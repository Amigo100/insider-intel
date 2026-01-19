-- Create stock_prices table for storing historical price data
CREATE TABLE public.stock_prices (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  ticker varchar NOT NULL,
  price_date date NOT NULL,
  open numeric(12, 4),
  high numeric(12, 4),
  low numeric(12, 4),
  close numeric(12, 4) NOT NULL,
  volume bigint,
  created_at timestamptz DEFAULT now(),

  -- Unique constraint on ticker + date to prevent duplicates
  CONSTRAINT stock_prices_ticker_date_unique UNIQUE (ticker, price_date)
);

-- Create index for efficient lookups
CREATE INDEX idx_stock_prices_ticker_date ON public.stock_prices(ticker, price_date DESC);
CREATE INDEX idx_stock_prices_company_id ON public.stock_prices(company_id);

-- Add RLS policy for public read access
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to stock prices"
ON public.stock_prices
FOR SELECT
TO anon, authenticated
USING (true);

-- Add comment explaining the table
COMMENT ON TABLE public.stock_prices IS 'Historical daily stock prices for trend visualization. Updated daily via cron job using yfinance API.';
