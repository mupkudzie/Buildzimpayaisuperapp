-- Create the single state table for simplistic JSON storage
CREATE TABLE IF NOT EXISTS public.app_state (
  id integer PRIMARY KEY,
  state jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We are using a single-row design where `id = 1` holds the entire `AppState` object.
-- This guarantees atomic saving/loading of the state without complex relational joins
-- and seamlessly acts as a drop-in replacement for the browser's localStorage.

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access to app_state"
ON public.app_state FOR SELECT
TO anon
USING (true);

-- Allow anonymous update access (Since there is no actual Auth implemented for the admin panel beyond a shared password in JSON state, we allow anyone to upsert. In production, protect this using Supabase Auth)
CREATE POLICY "Allow anonymous update to app_state"
ON public.app_state FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anonymous insert to app_state"
ON public.app_state FOR INSERT
TO anon
WITH CHECK (true);

-- Initialize the first row if it doesn't exist to make updates smoother
INSERT INTO public.app_state (id, state)
VALUES (
  1, 
  '{
    "currencies": [
      { "code": "USD", "name": "US DOLLAR", "flag": "🇺🇸", "countryCode": "us", "buy": "6149", "sell": "9988" },
      { "code": "EUR", "name": "EURO", "flag": "🇪🇺", "countryCode": "eu", "buy": "8565", "sell": "" },
      { "code": "AED", "name": "UAE DIRHAM", "flag": "🇦🇪", "countryCode": "ae", "buy": "7654", "sell": "" },
      { "code": "GBP", "name": "POUND STERLING", "flag": "🇬🇧", "countryCode": "gb", "buy": "1119", "sell": "13195" }
    ],
    "lastUpdated": "2024-01-01T00:00:00.000Z",
    "adminPassword": "admin",
    "companyName": "AFC BANK",
    "displayMode": "video",
    "announcementText": "Welcome to our exchange!"
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;
