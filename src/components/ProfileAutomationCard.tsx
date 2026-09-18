import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Heart,
  Music,
  Moon,
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  ChatboxConfig,
  ChatboxProfile,
  ProfileAutomationRule,
  AppLanguage,
  ServerStatusResponse,
} from '../types';
import { translations } from '../lib/i18n';

interface ProfileAutomationCardProps {
  lang?: AppLanguage;
  config: ChatboxConfig;
  serverStatus: ServerStatusResponse;
  onUpdateRules: (rules: ProfileAutomationRule[], enabled: boolean) => void;
  onResetRules: () => void;
}

export const ProfileAutomationCard: React.FC<ProfileAutomationCardProps> = ({
  lang = 'en',
  config,
  serverStatus,
  onUpdateRules,
  onResetRules,
}) => {
  const t = translations[lang];
  const isEnabled = config.profileAutomationEnabled ?? config.automationEnabled ?? false;
  const rules = config.profileRules ?? config.automationRules ?? [];
  const profiles: ChatboxProfile[] = config.profiles ?? [];
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);

  const isHrStale =
    !serverStatus.hrState?.lastUpdated ||
    Date.now() - serverStatus.hrState.lastUpdated >= 20000;

  const liveHr =
    serverStatus.liveHrActive !== undefined
      ? serverStatus.liveHrActive
      : serverStatus.currentBpm > 0 && Boolean(serverStatus.hrState?.connected) && !isHrStale;

  const liveMedia =
    serverStatus.liveMediaActive ??
    Boolean(
      serverStatus.currentMedia?.isPlaying &&
        (serverStatus.currentMedia?.title || serverStatus.currentMedia?.artist)
    );

  const liveAfk = serverStatus.liveAfkActive ?? Boolean(serverStatus.afkState?.isAfk);

  const handleToggleMaster = () => {
    onUpdateRules(rules, !isEnabled);
  };

  const handleToggleRuleEnabled = (ruleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated, isEnabled);
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<ProfileAutomationRule>) => {
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r));
    onUpdateRules(updated, isEnabled);
  };

  const handleDeleteRule = (ruleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = rules.filter((r) => r.id !== ruleId);
    onUpdateRules(updated, isEnabled);
  };

  const handleAddRule = () => {
    const newId = `rule_custom_${Date.now()}`;
    const defaultTarget = profiles[0]?.id || 'profil_1_nur_musik';
    const newRule: ProfileAutomationRule = {
      id: newId,
      name:
        lang === 'de'
          ? 'Benutzerdefinierte Bedingungsregel'
          : 'Custom Automation Rule',
      enabled: true,
      targetProfileId: defaultTarget,
      conditions: {
        heartRate: 'false',
        media: 'true',
        afk: 'any',
      },
    };
    const updated = [newRule, ...rules];
    onUpdateRules(updated, isEnabled);
    setExpandedRuleId(newId);
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= rules.length) return;
    const copy = [...rules];
    const item = copy.splice(index, 1)[0];
    copy.splice(newIndex, 0, item);
    onUpdateRules(copy, isEnabled);
  };

  const getProfileName = (profileId: string) => {
    const found = profiles.find((p) => p.id === profileId);
    return found ? found.name : profileId;
  };

  return (
    <div id="card-profile-automation" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.profileAutomation.title}
              {isEnabled && (
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {t.profileAutomation.activeStatus}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.profileAutomation.subtitle}</p>
          </div>
        </div>

        {/* Master Toggle Button */}
        <button
          id="btn-toggle-profile-automation"
          type="button"
          onClick={handleToggleMaster}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isEnabled
              ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-sm shadow-purple-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEnabled ? t.profileAutomation.activeStatus : t.profileAutomation.masterToggle}</span>
        </button>
      </div>

      {/* Live Conditions HUD */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-purple-400" />
            {t.profileAutomation.liveState}
          </span>
          {isEnabled && serverStatus.matchedRuleName && (
            <span className="text-purple-300 font-mono text-[10px] bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 truncate max-w-[220px]">
              {getProfileName(serverStatus.autoActiveProfileId || serverStatus.computedActiveProfileId || '')}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Heart Rate Signal */}
          <div
            className={`p-2 rounded-lg border transition-all ${
              liveHr
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/60 border-slate-800/70 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-xs font-semibold mb-0.5">
              <Heart
                className={`w-3.5 h-3.5 ${liveHr ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}
              />
              <span>{lang === 'de' ? 'Puls' : 'Heart Rate'}</span>
            </div>
            <div className="text-[10px] font-mono">
              {liveHr
                ? `${serverStatus.currentBpm || 0} BPM (${t.profileAutomation.optTrue})`
                : t.profileAutomation.optFalse}
            </div>
          </div>

          {/* Media / Spotify Signal */}
          <div
            className={`p-2 rounded-lg border transition-all ${
              liveMedia
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800/70 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-xs font-semibold mb-0.5">
              <Music className={`w-3.5 h-3.5 ${liveMedia ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{lang === 'de' ? 'Musik' : 'Media'}</span>
            </div>
            <div className="text-[10px] font-mono truncate">
              {liveMedia
                ? `${t.profileAutomation.optTrue} (${serverStatus.currentMedia?.title || 'Playing'})`
                : t.profileAutomation.optFalse}
            </div>
          </div>

          {/* AFK Signal */}
          <div
            className={`p-2 rounded-lg border transition-all ${
              liveAfk
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/60 border-slate-800/70 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-xs font-semibold mb-0.5">
              <Moon className={`w-3.5 h-3.5 ${liveAfk ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>AFK</span>
            </div>
            <div className="text-[10px] font-mono">
              {liveAfk
                ? `${t.profileAutomation.optTrue} (${serverStatus.afkState?.source || 'AFK'})`
                : t.profileAutomation.optFalse}
            </div>
          </div>
        </div>
      </div>

      {/* Rules List / Builder */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            {t.profileAutomation.rulesListTitle} ({rules.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              id="btn-reset-automation-rules"
              type="button"
              onClick={onResetRules}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.profileAutomation.resetDefaultRulesBtn}</span>
            </button>
            <button
              id="btn-add-automation-rule"
              type="button"
              onClick={handleAddRule}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all cursor-pointer shadow-sm shadow-purple-900/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.profileAutomation.addRuleBtn}</span>
            </button>
          </div>
        </div>

        {rules.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
            {t.profileAutomation.noRulesYet}
          </div>
        )}

        {rules.map((rule, idx) => {
          const isMatched = (serverStatus.matchedRuleId === rule.id || serverStatus.activeAutomationRuleId === rule.id) && isEnabled;
          const isExpanded = expandedRuleId === rule.id;

          return (
            <div
              key={rule.id}
              id={`rule-item-${rule.id}`}
              className={`rounded-xl border transition-all ${
                isMatched
                  ? 'bg-purple-950/40 border-purple-500/70 ring-1 ring-purple-500/30 shadow-md shadow-purple-950/40'
                  : rule.enabled
                  ? 'bg-slate-950/90 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/50 opacity-60'
              }`}
            >
              {/* Rule Summary Bar */}
              <div
                onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                className="p-3 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Enable Checkbox */}
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onClick={(e) => handleToggleRuleEnabled(rule.id, e)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer shrink-0"
                    title={rule.enabled ? 'Regel aktiv' : 'Regel deaktiviert'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {rule.name}
                      </span>
                      {isMatched && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded shrink-0">
                          {t.profileAutomation.ruleMatchedNow}
                        </span>
                      )}
                    </div>

                    {/* Condition Summary Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                      <span className="text-slate-400">{lang === 'de' ? 'WENN:' : 'IF:'}</span>

                      {/* Heart Rate Pill */}
                      <span
                        className={`px-1.5 py-0.5 rounded border ${
                          rule.conditions.heartRate === 'true'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                            : rule.conditions.heartRate === 'false'
                            ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        💓 Puls ={' '}
                        {rule.conditions.heartRate === 'true'
                          ? t.profileAutomation.optTrue
                          : rule.conditions.heartRate === 'false'
                          ? t.profileAutomation.optFalse
                          : t.profileAutomation.optAny}
                      </span>

                      {/* Media Pill */}
                      <span
                        className={`px-1.5 py-0.5 rounded border ${
                          rule.conditions.media === 'true'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                            : rule.conditions.media === 'false'
                            ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        🎵 Musik ={' '}
                        {rule.conditions.media === 'true'
                          ? t.profileAutomation.optTrue
                          : rule.conditions.media === 'false'
                          ? t.profileAutomation.optFalse
                          : t.profileAutomation.optAny}
                      </span>

                      {/* AFK Pill */}
                      {rule.conditions.afk && rule.conditions.afk !== 'any' && (
                        <span
                          className={`px-1.5 py-0.5 rounded border ${
                            rule.conditions.afk === 'true'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                              : 'bg-slate-800/80 text-slate-300 border-slate-700'
                          }`}
                        >
                          💤 AFK ={' '}
                          {rule.conditions.afk === 'true'
                            ? t.profileAutomation.optTrue
                            : t.profileAutomation.optFalse}
                        </span>
                      )}

                      <ArrowRight className="w-3 h-3 text-purple-400 inline shrink-0" />

                      {/* Target Profile Badge */}
                      <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-200 border border-purple-800/60 font-semibold truncate max-w-[140px]">
                        {getProfileName(rule.targetProfileId)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority and Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={(e) => handleMoveRule(idx, 'up', e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                    title={t.profileAutomation.moveUpTooltip}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rules.length - 1}
                    onClick={(e) => handleMoveRule(idx, 'down', e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                    title={t.profileAutomation.moveDownTooltip}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteRule(rule.id, e)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title={t.profileAutomation.deleteTooltip}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Rule Editor */}
              {isExpanded && (
                <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-3">
                  {/* Rule Name Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t.profileAutomation.ruleNameLabel}
                    </label>
                    <input
                      type="text"
                      value={rule.name}
                      placeholder={t.profileAutomation.ruleNamePlaceholder}
                      onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Conditions Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Heart Rate Condition */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {t.profileAutomation.conditionHrLabel}
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {[
                          { id: 'any', label: t.profileAutomation.optAny },
                          { id: 'true', label: t.profileAutomation.optTrue },
                          { id: 'false', label: t.profileAutomation.optFalse },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleUpdateRule(rule.id, {
                                conditions: { ...rule.conditions, heartRate: opt.id as any },
                              })
                            }
                            className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                              rule.conditions.heartRate === opt.id
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Media Condition */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <Music className="w-3 h-3 text-emerald-400" />
                        {t.profileAutomation.conditionMediaLabel}
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {[
                          { id: 'any', label: t.profileAutomation.optAny },
                          { id: 'true', label: t.profileAutomation.optTrue },
                          { id: 'false', label: t.profileAutomation.optFalse },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleUpdateRule(rule.id, {
                                conditions: { ...rule.conditions, media: opt.id as any },
                              })
                            }
                            className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                              rule.conditions.media === opt.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* AFK Condition */}
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-amber-400" />
                        {t.profileAutomation.conditionAfkLabel}
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {[
                          { id: 'any', label: t.profileAutomation.optAny },
                          { id: 'true', label: t.profileAutomation.optTrue },
                          { id: 'false', label: t.profileAutomation.optFalse },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleUpdateRule(rule.id, {
                                conditions: { ...rule.conditions, afk: opt.id as any },
                              })
                            }
                            className={`px-1.5 py-1 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                              (rule.conditions.afk || 'any') === opt.id
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target Profile Selector */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-purple-400" />
                      {t.profileAutomation.targetProfileLabel}
                    </label>
                    <select
                      value={rule.targetProfileId}
                      onChange={(e) => handleUpdateRule(rule.id, { targetProfileId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.template})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
