import React, { useState } from 'react';
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
        badgeClass: 'bg-emerald-950/40 text-gaming-green border-emerald-800/60 hover:bg-emerald-900/40',
        dotClass: 'bg-gaming-green',
      };
    }
    if (cloudStatus === 'not_ready') {
      return {
        label: t('cloud.statusNotReady'),
        icon: Database,
        badgeClass: 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    }
    return {
      label: t('cloud.statusOffline'),
      icon: CloudOff,
      badgeClass: 'bg-midnight-card text-slate-400 border-midnight-border hover:bg-midnight-hover',
      dotClass: 'bg-slate-500',
    };
  };

  const currentBadge = getStatusBadge();
  const Icon = currentBadge.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${currentBadge.badgeClass}`}
        title={`Supabase: ${cloudMessage || cloudStatus}`}
      >
        <span className={`w-2 h-2 rounded-full ${currentBadge.dotClass}`} />
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">{currentBadge.label}</span>
      </button>

      {/* Cloud Info & SQL Setup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-midnight-card rounded-2xl w-full max-w-xl text-white shadow-2xl p-6 my-8 border border-midnight-border animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-midnight-border">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    cloudStatus === 'connected'
                      ? 'bg-gaming-greenBg text-gaming-green border border-gaming-green/30'
                      : 'bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/30'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t('cloud.modalTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{SUPABASE_URL}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-midnight-hover transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4">
              {cloudStatus === 'connected' ? (
                <div className="p-4 rounded-xl bg-gaming-greenBg border border-gaming-green/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gaming-green flex-shrink-0" />
                  <p className="font-medium leading-relaxed">
                    {t('cloud.connectedDesc')}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-200 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Supabase Connected — Database Tables Needed</span>
                  </div>
                  <p className="text-amber-300/80 text-[11px] leading-relaxed">
                    {t('cloud.modalSubtitle')}
                  </p>
                </div>
              )}

              {/* SQL Code Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    SQL Schema Script (supabase-schema.sql)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-purple/20 hover:bg-brand-purple text-brand-purpleLight hover:text-white text-xs font-bold transition border border-brand-purple/30"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-gaming-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('cloud.copied') : t('cloud.copySql')}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-midnight-bg text-slate-300 font-mono text-[11px] max-h-56 overflow-y-auto border border-midnight-border">
                  <pre className="whitespace-pre-wrap">{SQL_SCHEMA_SCRIPT}</pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <a
                  href="https://supabase.com/dashboard/project/tqgcepxnarfgmgnryojc/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-purple hover:bg-brand-purpleHover text-white font-bold text-xs shadow-md shadow-brand-purple/30 flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('cloud.openSupabase')}
                </a>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-5 rounded-xl border border-midnight-border text-slate-300 hover:bg-midnight-hover font-semibold text-xs transition"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
