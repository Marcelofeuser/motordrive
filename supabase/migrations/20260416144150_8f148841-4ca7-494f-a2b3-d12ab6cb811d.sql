
-- Earnings table
CREATE TABLE public.earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT NOT NULL DEFAULT 'Uber',
  bruto NUMERIC(10,2) NOT NULL DEFAULT 0,
  gorjetas NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  dinheiro NUMERIC(10,2) NOT NULL DEFAULT 0,
  taxas NUMERIC(10,2) NOT NULL DEFAULT 0,
  pedagio NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own earnings" ON public.earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own earnings" ON public.earnings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own earnings" ON public.earnings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own earnings" ON public.earnings FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_earnings_user_date ON public.earnings (user_id, date DESC);
CREATE TRIGGER update_earnings_updated_at BEFORE UPDATE ON public.earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fueling table
CREATE TABLE public.fueling (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  fuel_type TEXT NOT NULL DEFAULT 'Gasolina',
  km NUMERIC(10,1) NOT NULL DEFAULT 0,
  liters NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.fueling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fueling" ON public.fueling FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own fueling" ON public.fueling FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fueling" ON public.fueling FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fueling" ON public.fueling FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_fueling_user_date ON public.fueling (user_id, date DESC);
CREATE TRIGGER update_fueling_updated_at BEFORE UPDATE ON public.fueling FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Journeys table
CREATE TABLE public.journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  km_initial NUMERIC(10,1) NOT NULL DEFAULT 0,
  km_final NUMERIC(10,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journeys" ON public.journeys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journeys" ON public.journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journeys" ON public.journeys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journeys" ON public.journeys FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_journeys_user_date ON public.journeys (user_id, date DESC);
CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON public.journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL DEFAULT 'daily',
  label TEXT NOT NULL DEFAULT '',
  target_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
