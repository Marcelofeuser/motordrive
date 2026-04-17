
-- Create electric_usage table
CREATE TABLE public.electric_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  km_initial NUMERIC(10,1) NOT NULL DEFAULT 0,
  km_final NUMERIC(10,1) NOT NULL DEFAULT 0,
  km_total NUMERIC(10,1) GENERATED ALWAYS AS (km_final - km_initial) STORED,
  battery_initial NUMERIC(5,1) NOT NULL DEFAULT 100,
  battery_final NUMERIC(5,1) NOT NULL DEFAULT 0,
  battery_consumption NUMERIC(5,1) GENERATED ALWAYS AS (battery_initial - battery_final) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.electric_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own electric_usage" ON public.electric_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own electric_usage" ON public.electric_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own electric_usage" ON public.electric_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own electric_usage" ON public.electric_usage FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_electric_usage_user_date ON public.electric_usage (user_id, date DESC);

-- Create electric_charging table
CREATE TABLE public.electric_charging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  kwh_charged NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost_per_kwh NUMERIC(8,4) GENERATED ALWAYS AS (CASE WHEN kwh_charged > 0 THEN total_cost / kwh_charged ELSE 0 END) STORED,
  charging_type TEXT NOT NULL DEFAULT 'home' CHECK (charging_type IN ('home', 'public', 'fast', 'free')),
  location TEXT,
  duration_minutes INTEGER,
  battery_before NUMERIC(5,1),
  battery_after NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.electric_charging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own electric_charging" ON public.electric_charging FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own electric_charging" ON public.electric_charging FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own electric_charging" ON public.electric_charging FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own electric_charging" ON public.electric_charging FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_electric_charging_user_date ON public.electric_charging (user_id, date DESC);

-- Create electric_alerts table
CREATE TABLE public.electric_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_battery', 'high_consumption', 'abnormal_cost', 'charging_reminder')),
  title TEXT NOT NULL,
  description TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.electric_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own electric_alerts" ON public.electric_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own electric_alerts" ON public.electric_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own electric_alerts" ON public.electric_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own electric_alerts" ON public.electric_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_electric_alerts_user ON public.electric_alerts (user_id, is_read, created_at DESC);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_electric_usage_updated_at BEFORE UPDATE ON public.electric_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_electric_charging_updated_at BEFORE UPDATE ON public.electric_charging FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
