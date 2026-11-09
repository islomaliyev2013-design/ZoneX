-- ====================================================================
-- PLAYSTATION MANAGER - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/tqgcepxnarfgmgnryojc/sql
-- ====================================================================

-- 1. PROFILES / ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at BIGINT NOT NULL
);

-- 2. ROOMS & STATIONS STATE TABLE
-- Stores live station occupancy & ongoing session timers per account
CREATE TABLE IF NOT EXISTS public.rooms_state (
    account_id TEXT PRIMARY KEY,
    rooms_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
-- Stores all completed gaming sessions and product sales
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'session',
    date_str TEXT NOT NULL,
    time_str TEXT NOT NULL,
    room_id INTEGER,
    room_name TEXT NOT NULL,
    station_id TEXT,
    station_name TEXT,
    customer_name TEXT,
    start_time BIGINT,
    end_time BIGINT,
    duration_ms BIGINT DEFAULT 0,
    hourly_price NUMERIC(10, 2) DEFAULT 0,
    gaming_payment NUMERIC(10, 2) DEFAULT 0,
    products JSONB DEFAULT '[]'::jsonb,
    product_revenue NUMERIC(10, 2) DEFAULT 0,
    product_cost NUMERIC(10, 2) DEFAULT 0,
    product_profit NUMERIC(10, 2) DEFAULT 0,
    total_profit NUMERIC(10, 2) DEFAULT 0,
    total_paid NUMERIC(10, 2) DEFAULT 0,
    created_at BIGINT NOT NULL
);

-- Index for fast date-based report and history queries
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON public.transactions(account_id, date_str);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 4. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.business_settings (
    account_id TEXT PRIMARY KEY,
    currency TEXT DEFAULT '$',
    default_hourly_rate NUMERIC(10, 2) DEFAULT 15,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public/anon access for the application client
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all application clients using publishable key
CREATE POLICY "Allow anon all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on rooms_state" ON public.rooms_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on business_settings" ON public.business_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Admin Account if not already present
INSERT INTO public.profiles (id, username, password, full_name, email, role, created_at)
VALUES (
    'account_admin',
    'admin',
    'admin123',
    'Administrator',
    'admin@playstation.local',
    'admin',
    1731140000000
) ON CONFLICT (username) DO NOTHING;

