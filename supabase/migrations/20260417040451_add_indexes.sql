-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_earnings_user_date ON public.earnings (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fueling_user_date ON public.fueling (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journeys_user_date ON public.journeys (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_platform_imports_user_date ON public.platform_imports (user_id, trip_date DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_user ON public.integrations (user_id);
