-- ====================================================================
-- PLAYSTATION MANAGER - TO'LIQ VA AVTOMATIK SINXRONIZATSIYA SQL KODI
-- Ushbu skriptni Supabase SQL Editor-da ishga tushiring:
-- https://supabase.com/dashboard/project/tqgcepxnarfgmgnryojc/sql/new
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. FOYDALANUVCHILAR VA PROFILLAR JADVALI
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at BIGINT NOT NULL
);

-- 2. XONALAR VA JONLI SEANSLAR HOLATI
CREATE TABLE IF NOT EXISTS public.rooms_state (
    account_id TEXT PRIMARY KEY,
    rooms_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANZAKSIYALAR VA HISOBOTLAR JADVALI
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
    hourly_price NUMERIC(12, 2) DEFAULT 0,
    gaming_payment NUMERIC(12, 2) DEFAULT 0,
    products JSONB DEFAULT '[]'::jsonb,
    product_revenue NUMERIC(12, 2) DEFAULT 0,
    product_cost NUMERIC(12, 2) DEFAULT 0,
    product_profit NUMERIC(12, 2) DEFAULT 0,
    total_profit NUMERIC(12, 2) DEFAULT 0,
    total_paid NUMERIC(12, 2) DEFAULT 0,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON public.transactions(account_id, date_str);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 4. BIZNES SOZLAMALARI
CREATE TABLE IF NOT EXISTS public.business_settings (
    account_id TEXT PRIMARY KEY,
    currency TEXT DEFAULT 'so''m',
    default_hourly_rate NUMERIC(12, 2) DEFAULT 20000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Xavfsizlik qoidalari
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon all on rooms_state" ON public.rooms_state;
DROP POLICY IF EXISTS "Allow anon all on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow anon all on business_settings" ON public.business_settings;

CREATE POLICY "Allow anon all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on rooms_state" ON public.rooms_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on business_settings" ON public.business_settings FOR ALL USING (true) WITH CHECK (true);

-- Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms_state;
  END IF;
END $$;

-- ====================================================================
-- AVTOMATIK TRIGGER: KIM RO'YXATDAN O'TSA, AVTOMATIK AUTH.USERS GA TUSHADI!
-- ====================================================================
CREATE OR REPLACE FUNCTION public.sync_profile_to_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    auth_user_id uuid;
BEGIN
    SELECT id INTO auth_user_id FROM auth.users WHERE email = NEW.email;

    IF auth_user_id IS NULL THEN
        auth_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            auth_user_id,
            'authenticated',
            'authenticated',
            NEW.email,
            crypt(NEW.password, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', NEW.full_name, 'username', NEW.username),
            NOW(),
            NOW()
        );

        INSERT INTO auth.identities (
            id, user_id, identity_data, provider, provider_id, created_at, updated_at
        ) VALUES (
            auth_user_id,
            auth_user_id,
            jsonb_build_object('sub', auth_user_id, 'email', NEW.email),
            'email',
            auth_user_id,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
    ELSE
        UPDATE auth.users
        SET 
            encrypted_password = crypt(NEW.password, gen_salt('bf')),
            raw_user_meta_data = jsonb_build_object('full_name', NEW.full_name, 'username', NEW.username),
            updated_at = NOW()
        WHERE id = auth_user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_profile_to_auth ON public.profiles;
CREATE TRIGGER tr_sync_profile_to_auth
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_to_auth_user();

-- ====================================================================
-- BARCHA FOYDALANUVCHILARNI QO'SHISH (ADMIN, JONIBEK, ISLOM, BOBUR, JOHA)
-- ====================================================================
INSERT INTO public.profiles (id, username, password, full_name, email, role, created_at)
VALUES 
    ('account_admin', 'admin', 'admin123', 'Administrator', 'admin@gmail.com', 'admin', 1731140000000),
    ('account_jonibek', 'jonibek', 'admin123', 'Jonibek', 'jonibek@gmail.com', 'admin', 1731140000000),
    ('account_islom', 'islom', 'admin123', 'Islom', 'islom@gmail.com', 'user', 1731140000000),
    ('account_bobur', 'bobur', 'admin123', 'Bobur', 'bobur@gmail.com', 'user', 1731140000000),
    ('account_joha', 'joha', 'admin123', 'Joha', 'joha@gmail.com', 'user', 1731140000000)
ON CONFLICT (username) DO UPDATE SET 
    email = EXCLUDED.email, 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name;

-- ====================================================================
-- AUTH.USERS GA BIR MARTALIK TO'LIQ SINXRONIZATSIYA
-- ====================================================================
DO $$
DECLARE
    r RECORD;
    new_id uuid;
BEGIN
    FOR r IN SELECT * FROM public.profiles LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
            new_id := gen_random_uuid();
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password,
                email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_id, 'authenticated', 'authenticated', r.email,
                crypt(r.password, gen_salt('bf')), NOW(),
                '{"provider":"email","providers":["email"]}'::jsonb,
                jsonb_build_object('full_name', r.full_name, 'username', r.username),
                NOW(), NOW()
            );

            INSERT INTO auth.identities (
                id, user_id, identity_data, provider, provider_id, created_at, updated_at
            ) VALUES (
                new_id, new_id,
                jsonb_build_object('sub', new_id, 'email', r.email),
                'email', new_id, NOW(), NOW()
            ) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- ====================================================================
-- NATIJANI JADVAL QILIB CHIQARISH:
-- ====================================================================
SELECT 
    p.username AS "Login",
    p.password AS "Parol",
    p.email AS "Email",
    p.full_name AS "Ism",
    '✅ Faol va ulangan' AS "Holat"
FROM public.profiles p
ORDER BY p.username;
