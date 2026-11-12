import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CloudOff, AlertCircle, Copy, Check, ExternalLink, X, Database, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPABASE_URL } from '../lib/supabase';

const SQL_SCHEMA_SCRIPT = `-- PLAYSTATION MANAGER - SUPABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.rooms_state (
    account_id TEXT PRIMARY KEY,
    rooms_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.business_settings (
    account_id TEXT PRIMARY KEY,
    currency TEXT DEFAULT '$',
    default_hourly_rate NUMERIC(10, 2) DEFAULT 15,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on rooms_state" ON public.rooms_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on business_settings" ON public.business_settings FOR ALL USING (true) WITH CHECK (true);`;

export default function CloudSyncBadge() {
  const { cloudStatus, cloudMessage } = useApp();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getStatusBadge = () => {
    if (cloudStatus === 'connected') {
      return {
        label: t('cloud.statusConnected'),
        icon: Cloud,
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
        dotClass: 'bg-emerald-400',
      };
    }
    if (cloudStatus === 'not_ready') {
      return {
        label: t('cloud.statusNotReady'),
        icon: Database,
        badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    }
    return {
      label: t('cloud.statusOffline'),
      icon: CloudOff,
      badgeClass: 'bg-[#101014] text-[#A1A1AA] border-[rgba(167,139,250,0.15)] hover:bg-[#1D1B2E]',
      dotClass: 'bg-[#A1A1AA]',
    };
  };

  const currentBadge = getStatusBadge();
  const Icon = currentBadge.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${currentBadge.badgeClass}`}
        title={`Supabase: ${cloudMessage || cloudStatus}`}
      >
        <span className={`w-2 h-2 rounded-full ${currentBadge.dotClass}`} />
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">{currentBadge.label}</span>
      </button>

      {/* Cloud Info & SQL Setup Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-[#1D1B2E] rounded-2xl w-full max-w-xl text-white shadow-2xl p-6 my-8 border border-[rgba(167,139,250,0.15)] animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[rgba(167,139,250,0.15)]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    cloudStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[rgba(167,139,250,0.3)]'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('cloud.modalTitle')}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-mono">{SUPABASE_URL}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#101014] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4">
              {cloudStatus === 'connected' ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <p className="font-medium leading-relaxed">
                    {t('cloud.connectedDesc')}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Supabase Connected — Database Tables Needed</span>
                  </div>
                  <p className="text-amber-200/80 text-[11px] leading-relaxed">
                    {t('cloud.modalSubtitle')}
                  </p>
                </div>
              )}

              {/* SQL Code Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wide">
                    SQL Schema Script (supabase-schema.sql)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7C3AED]/20 hover:bg-[#7C3AED] text-[#A78BFA] hover:text-white text-xs font-bold transition border border-[rgba(167,139,250,0.3)] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('cloud.copied') : t('cloud.copySql')}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#101014] text-[#A78BFA] font-mono text-[11px] max-h-56 overflow-y-auto border border-[rgba(167,139,250,0.2)]">
                  <pre className="whitespace-pre-wrap">{SQL_SCHEMA_SCRIPT}</pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://supabase.com/dashboard/project/tqgcepxnarfgmgnryojc/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-[0_0_15px_rgba(124,58,237,0.35)] flex items-center justify-center gap-2 transition"
                >
                  <span>{t('cloud.openSupabaseSql')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[rgba(167,139,250,0.15)] text-[#A1A1AA] hover:bg-[#101014] hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  {t('cloud.close')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
