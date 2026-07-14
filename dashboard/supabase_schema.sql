-- ============================================================
-- CropCalm Database Schema
-- Run this entire file in Supabase -> SQL Editor -> New Query
-- ============================================================

-- 1. PROFILES TABLE
-- Stores onboarding data, personal info, and threat profile per user.
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT,
  phone         TEXT,
  email         TEXT,
  village       TEXT,
  state         TEXT,
  lat           FLOAT,
  lng           FLOAT,
  animal_sightings TEXT[],
  threat_profile   JSONB DEFAULT '{}'::jsonb,
  onboarding_done  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (users can only see their own profile)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. DEVICES TABLE
-- Each user owns their own collection of devices (hub + nodes).
CREATE TABLE IF NOT EXISTS public.devices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('hub', 'node')),
  status         TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'alert')),
  position_angle INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON public.devices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.devices FOR UPDATE USING (auth.uid() = user_id);


-- 3. TELEMETRY TABLE
-- Stores the latest sensor readings per device.
CREATE TABLE IF NOT EXISTS public.telemetry (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id             UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  ultrasonic_cm         INT DEFAULT 450,
  pir_triggered         BOOLEAN DEFAULT FALSE,
  microwave_triggered   BOOLEAN DEFAULT FALSE,
  threat_level          INT DEFAULT 0 CHECK (threat_level BETWEEN 0 AND 3),
  recorded_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

-- Telemetry is readable if the device belongs to the user
CREATE POLICY "Users can view telemetry of own devices"
  ON public.telemetry FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = telemetry.device_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert telemetry of own devices"
  ON public.telemetry FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.devices d
      WHERE d.id = telemetry.device_id AND d.user_id = auth.uid()
    )
  );
