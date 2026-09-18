import React from 'react';
import { Cpu, HardDrive, Gauge, Thermometer, Sparkles } from 'lucide-react';
import { AppLanguage, HardwareStats } from '../types';
import { translations } from '../lib/i18n';

interface HardwareStatsCardProps {
  lang?: AppLanguage;
  stats?: HardwareStats;
  enabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onInsertVariable: (varName: string) => void;
}

export const HardwareStatsCard: React.FC<HardwareStatsCardProps> = ({
  lang = 'en',
  stats,
  enabled,
  onToggleEnabled,
  onInsertVariable,
}) => {
  const t = translations[lang];
  const cpuPercent = stats?.cpuPercent ?? 0;
  const ramPercent = stats?.ramPercent ?? 0;
  const ramUsedGb = stats?.ramUsedGb ?? 0;
  const ramTotalGb = stats?.ramTotalGb ?? 0;
  const gpuPercent = stats?.gpuPercent;
  const cpuTemp = stats?.cpuTemp;
  const gpuTemp = stats?.gpuTemp;

  const hardwareVariables = [
    { tag: '{cpu}', desc: lang === 'de' ? 'CPU Auslastung %' : 'CPU Load %' },
    { tag: '{ram}', desc: lang === 'de' ? 'RAM Auslastung %' : 'RAM Load %' },
    { tag: '{ram_gb}', desc: lang === 'de' ? 'RAM (z.B. 8.4/16GB)' : 'RAM (e.g. 8.4/16GB)' },
    { tag: '{gpu}', desc: lang === 'de' ? 'GPU % (Nvidia)' : 'GPU % (Nvidia)' },
    { tag: '{cpu_temp}', desc: lang === 'de' ? 'CPU Temperatur' : 'CPU Temp' },
    { tag: '{gpu_temp}', desc: lang === 'de' ? 'GPU Temperatur' : 'GPU Temp' },
    { tag: '{hw}', desc: lang === 'de' ? 'Kompakte Zusammenfassung' : 'Compact Summary' },
  ];

  return (
    <div id="card-hardware-stats" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.hardwareStats.title}
              {enabled ? (
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {t.hardwareStats.active}
                </span>
              ) : (
                <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {t.hardwareStats.inactive}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.hardwareStats.subtitle}</p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="toggle-hardware-stats"
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggleEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Live Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* CPU Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> CPU
            </span>
            {cpuTemp ? <span className="text-[11px] text-emerald-400">{cpuTemp}°C</span> : null}
          </div>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-xl font-bold font-mono text-white">{cpuPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                cpuPercent > 85 ? 'bg-rose-500' : cpuPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, cpuPercent))}%` }}
            />
          </div>
        </div>

        {/* RAM Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" /> RAM
            </span>
            <span className="text-[10px] text-slate-400">{ramUsedGb}/{ramTotalGb}GB</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-xl font-bold font-mono text-white">{ramPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                ramPercent > 85 ? 'bg-rose-500' : ramPercent > 70 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, ramPercent))}%` }}
            />
          </div>
        </div>

        {/* GPU Box (Optional) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" /> GPU
            </span>
            {gpuTemp ? <span className="text-[11px] text-purple-400">{gpuTemp}°C</span> : null}
          </div>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-xl font-bold font-mono text-white">
              {gpuPercent !== undefined ? `${gpuPercent}%` : '--'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${gpuPercent !== undefined ? Math.min(100, Math.max(0, gpuPercent)) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Insert Tags */}
      <div>
        <span className="text-xs font-semibold text-slate-300 block mb-2">{t.hardwareStats.availableTags}</span>
        <div className="flex flex-wrap gap-1.5">
          {hardwareVariables.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => onInsertVariable(v.tag)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer"
              title={v.desc}
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{v.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
