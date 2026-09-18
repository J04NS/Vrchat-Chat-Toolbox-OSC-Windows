import React, { useState } from 'react';
import { Moon, Clock, Radio, Footprints, ShieldCheck, Activity } from 'lucide-react';
import { AfkState, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface AfkDetectionCardProps {
  lang?: AppLanguage;
  afkState?: AfkState;
  enabled: boolean;
  afkMode?: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only';
  timeoutMinutes: number;
  template: string;
  overrideChatbox: boolean;
  onUpdateConfig: (updates: {
    afkEnabled?: boolean;
    afkMode?: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only';
    afkTimeoutMinutes?: number;
    afkTemplate?: string;
    afkOverrideChatbox?: boolean;
  }, notifyMsg?: string) => Promise<void> | void;
  onInsertMainVariable: (tag: string) => void;
}

export const AfkDetectionCard: React.FC<AfkDetectionCardProps> = ({
  lang = 'en',
  afkState,
  enabled,
  afkMode = 'vrchat_and_timer',
  timeoutMinutes,
  template,
  overrideChatbox,
  onUpdateConfig,
  onInsertMainVariable,
}) => {
  const t = translations[lang];
  const [isTogglingManual, setIsTogglingManual] = useState(false);

  const isAfk = afkState?.isAfk ?? false;
  const afkDurationSec = afkState?.afkDurationSec ?? 0;
  const afkSource = afkState?.source ?? 'none';
  const lastMovementTime = afkState?.lastMovementTime ?? 0;
  const isMovingRecently = Date.now() - lastMovementTime < 4000;

  const formatAfkDuration = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleToggleManualAfk = async () => {
    setIsTogglingManual(true);
    try {
      await fetch('/api/afk/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceAfk: !isAfk }),
      });
    } catch {}
    setTimeout(() => setIsTogglingManual(false), 300);
  };

  const getSourceLabel = (src: string) => {
    switch (src) {
      case 'vrchat_osc':
        return lang === 'de' ? 'VRChat Avatar AFK Parameter (/avatar/parameters/AFK)' : 'VRChat Avatar AFK Parameter';
      case 'timer':
        return lang === 'de' ? `Inaktivitäts-Timer (${timeoutMinutes} Min)` : `Inactivity Timer (${timeoutMinutes}m)`;
      case 'manual':
        return lang === 'de' ? 'Manuell ausgelöst' : 'Manually Triggered';
      case 'vrchat_movement':
        return lang === 'de' ? 'VRChat Bewegung registriert' : 'VRChat Movement Detected';
      default:
        return lang === 'de' ? 'Keine' : 'None';
    }
  };

  return (
    <div id="card-afk-detection" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Moon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.afk.title}
              {isAfk ? (
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  <Moon className="w-3 h-3" /> {t.afk.isAfk} ({formatAfkDuration(afkDurationSec)})
                </span>
              ) : enabled ? (
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {t.afk.active}
                </span>
              ) : (
                <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {t.afk.inactive}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.afk.subtitle}</p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-afk-master"
            type="checkbox"
            checked={enabled}
            onChange={(e) => onUpdateConfig({ afkEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* Live AFK Status Box */}
      <div className={`p-4 rounded-xl border transition-all ${
        isAfk
          ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-500/10'
          : 'bg-slate-950/70 border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isAfk ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isAfk ? t.afk.isAfk : t.afk.isOnline}
              </span>
              {isAfk && (
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                  {formatAfkDuration(afkDurationSec)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isAfk ? (
                <span>{lang === 'de' ? 'Ausgelöst durch: ' : 'Triggered by: '}<strong>{getSourceLabel(afkSource)}</strong></span>
              ) : (
                <span>{lang === 'de' ? 'VRChat Ingress lauscht auf UDP 9001 auf Bewegung & AFK Parameter' : 'VRChat Ingress listening on UDP 9001 for motion & AFK'}</span>
              )}
            </p>
          </div>

          <button
            id="btn-toggle-manual-afk"
            type="button"
            onClick={handleToggleManualAfk}
            disabled={isTogglingManual}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer shrink-0 ${
              isAfk
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {isAfk ? (lang === 'de' ? 'AFK beenden' : 'End AFK') : (lang === 'de' ? 'Manuell AFK' : 'Set AFK')}
          </button>
        </div>

        {/* Live Movement Indicator */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Footprints className={`w-3.5 h-3.5 ${isMovingRecently ? 'text-emerald-400 animate-bounce' : 'text-slate-600'}`} />
            <span>{isMovingRecently ? (lang === 'de' ? 'Avatar-Bewegung erkannt!' : 'Avatar movement active!') : (lang === 'de' ? 'Keine Bewegung' : 'Idle')}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            UDP: 9001
          </span>
        </div>
      </div>

      {/* AFK Detection Mode & Timeout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Detection Mode */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t.afk.modeLabel}</label>
          <select
            id="select-afk-mode"
            value={afkMode}
            onChange={(e) => onUpdateConfig({ afkMode: e.target.value as any })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="vrchat_and_timer">{t.afk.modeBoth}</option>
            <option value="vrchat_only">{t.afk.modeOscOnly}</option>
            <option value="timer_only">{t.afk.modeTimerOnly}</option>
          </select>
        </div>

        {/* Inactivity Timeout */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t.afk.timeoutLabel}</label>
          <select
            id="select-afk-timeout"
            value={timeoutMinutes || 5}
            onChange={(e) => onUpdateConfig({ afkTimeoutMinutes: Number(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value={2}>2 {lang === 'de' ? 'Minuten' : 'Minutes'}</option>
            <option value={5}>5 {lang === 'de' ? 'Minuten (Empfohlen)' : 'Minutes (Recommended)'}</option>
            <option value={10}>10 {lang === 'de' ? 'Minuten' : 'Minutes'}</option>
            <option value={15}>15 {lang === 'de' ? 'Minuten' : 'Minutes'}</option>
            <option value={30}>30 {lang === 'de' ? 'Minuten' : 'Minutes'}</option>
          </select>
        </div>
      </div>

      {/* AFK Template & Override */}
      <div className="space-y-2">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">{t.afk.overrideTitle}</span>
            <span className="text-[11px] text-slate-400">{t.afk.overrideDesc}</span>
          </div>
          <input
            id="toggle-afk-override"
            type="checkbox"
            checked={overrideChatbox}
            onChange={(e) => onUpdateConfig({ afkOverrideChatbox: e.target.checked })}
            className="w-4 h-4 text-amber-600 bg-slate-900 border-slate-700 rounded focus:ring-amber-500 cursor-pointer"
          />
        </label>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t.afk.templateLabel}</label>
          <input
            id="input-afk-template"
            type="text"
            value={template}
            onChange={(e) => onUpdateConfig({ afkTemplate: e.target.value })}
            placeholder="💤 AFK [{afk_time}] - Back soon!"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
};
