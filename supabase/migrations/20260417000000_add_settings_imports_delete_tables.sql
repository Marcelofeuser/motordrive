
-- ============================
-- user_settings
-- ============================
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  cnh_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  fines_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  discount_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  ipva_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  insurance_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  maintenance_alert_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_extract_documents BOOLEAN NOT NULL DEFAULT true,
  ai_financial_copilot BOOLEAN NOT NULL DEFAULT false,
  default_state TEXT DEFAULT 'GO',
  default_discount_percent NUMERIC(5,2) DEFAULT 40,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'pt-BR',
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================
-- account_deletion_requests
-- ============================
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own deletion requests" ON public.account_deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own deletion requests" ON public.account_deletion_requests FOR SELECT USING (auth.uid() = user_id);

-- ============================
-- integrations
-- ============================
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  account_label TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own integrations" ON public.integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own integrations" ON public.integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integrations FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================
-- earnings_imports
-- ============================
CREATE TABLE public.earnings_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT '99',
  storage_path TEXT,
  original_filename TEXT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  extracted_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.earnings_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own earnings imports" ON public.earnings_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own earnings imports" ON public.earnings_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own earnings imports" ON public.earnings_imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own earnings imports" ON public.earnings_imports FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_earnings_imports_user ON public.earnings_imports (user_id, created_at DESC);
CREATE TRIGGER update_earnings_imports_updated_at BEFORE UPDATE ON public.earnings_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================
-- manual_earnings
-- ============================
CREATE TABLE public.manual_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT '99',
  trip_date DATE NOT NULL,
  gross_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(10,2) NOT NULL DEFAULT 0,
  fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  online_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'ai',
  import_id UUID REFERENCES public.earnings_imports(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.manual_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own manual earnings" ON public.manual_earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own manual earnings" ON public.manual_earnings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own manual earnings" ON public.manual_earnings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own manual earnings" ON public.manual_earnings FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_manual_earnings_user_date ON public.manual_earnings (user_id, trip_date DESC);
CREATE TRIGGER update_manual_earnings_updated_at BEFORE UPDATE ON public.manual_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================
-- platform_imports (backward compat for existing Integracoes.tsx code)
-- ============================
CREATE TABLE public.platform_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT '99',
  trip_date DATE NOT NULL,
  gross_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonuses NUMERIC(10,2) NOT NULL DEFAULT 0,
  fees NUMERIC(10,2) NOT NULL DEFAULT 0,
  online_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'ai',
  source_file TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own platform imports" ON public.platform_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own platform imports" ON public.platform_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platform imports" ON public.platform_imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own platform imports" ON public.platform_imports FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_platform_imports_user_date ON public.platform_imports (user_id, trip_date DESC);
CREATE TRIGGER update_platform_imports_updated_at BEFORE UPDATE ON public.platform_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================
-- Storage bucket: earnings-imports
-- ============================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'earnings-imports',
  'earnings-imports',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own earnings imports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'earnings-imports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read own earnings imports" ON storage.objects
  FOR SELECT USING (bucket_id = 'earnings-imports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own earnings imports" ON storage.objects
  FOR DELETE USING (bucket_id = 'earnings-imports' AND auth.uid()::text = (storage.foldername(name))[1]);
