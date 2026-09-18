import React, { useEffect, useState } from 'react';
import { Radio, Volume2, VolumeX, Send, AlertTriangle, Clock, RefreshCw, Moon, Sparkles } from 'lucide-react';
import { formatChatboxMessage, getHeartIcon } from '../lib/formatter';
import { AfkState, AppLanguage, HardwareStats, HeartRateState, MediaState } from '../types';
import { translations } from '../lib/i18n';

interface ChatboxPreviewProps {
  lang?: AppLanguage;
  template: string;
  hrState: HeartRateState;
  mediaState: MediaState;
  customStatus: string;
  marqueeEnabled: boolean;
  marqueeWidth: number;
  playSound: boolean;
  bypassTyping: boolean;
  updateIntervalMs: number;
  isActive: boolean;
  hardwareStats?: HardwareStats;
  afkState?: AfkState;
  afkTemplate?: string;
  afkOverrideChatbox?: boolean;
  customTexts?: string[];
  currentCustomTextIndex?: number;
  mediaOnlyWhenPlaying?: boolean;
  isAutomated?: boolean;
  activeProfileName?: string;
  onSendManual: (text: string) => Promise<void>;
}

export const ChatboxPreview: React.FC<ChatboxPreviewProps> = ({
  lang = 'en',
  template,
  hrState,
  mediaState,
  customStatus,
  marqueeEnabled,
  marqueeWidth,
  playSound,
  bypassTyping,
  updateIntervalMs,
  isActive,
  hardwareStats,
  afkState,
  afkTemplate,
  afkOverrideChatbox,
  customTexts,
  currentCustomTextIndex,
  mediaOnlyWhenPlaying,
  isAutomated,
  activeProfileName,
  onSendManual,
}) => {
  const t = translations[lang];
  const [tick, setTick] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, Math.max(1000, updateIntervalMs));
    return () => clearInterval(timer);
  }, [updateIntervalMs]);

  const { fullText, displayText, isOverflow } = formatChatboxMessage({
    template,
    hrState,
    mediaState,
    customStatus,
    tick,
    marqueeEnabled,
    marqueeWidth,
    mediaOnlyWhenPlaying: mediaOnlyWhenPlaying !== false,
    hardwareStats,
    afkState,
    afkTemplate,
    afkOverrideChatbox,
    customTexts,
    currentCustomTextIndex,
  });

  const handleSendNow = async () => {
    setIsSending(true);
    await onSendManual(fullText);
    setTimeout(() => setIsSending(false), 300);
  };

  const heartEmoji = getHeartIcon(hrState.bpm, tick);

  return (
    <div id="card-chatbox-preview" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.preview.title}
              {isAutomated && (
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {activeProfileName || t.preview.autoProfileBadge}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.preview.subtitle}</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {afkState?.isAfk && (
            <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-pulse">
              <Moon className="w-3.5 h-3.5" />
              AFK
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {isActive ? t.preview.broadcasting : t.preview.paused}
          </span>
        </div>
      </div>

      {/* Main VRChat Speech Bubble Simulation */}
      <div className="relative mb-4">
        {/* Chatbox Bubble */}
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-blue-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          {/* Top Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-semibold">{t.preview.vrchatHud}</span>
              <span>•</span>
              <span className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {Math.round(updateIntervalMs / 1000)}s {t.preview.intervalSec}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {playSound ? (
                <span className="flex items-center gap-1 text-emerald-400" title={t.preview.soundOn}>
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-500" title={t.preview.soundOff}>
                  <VolumeX className="w-3.5 h-3.5" />
                </span>
              )}
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                {displayText.length} / 144 {t.preview.chars}
              </span>
            </div>
          </div>

          {/* Rendered Text */}
          <div className="py-3 px-1 min-h-[4rem] flex items-center">
            <p className="text-base sm:text-lg font-bold text-white font-mono whitespace-pre-wrap leading-relaxed tracking-wide drop-shadow-sm">
              {displayText || (
                <span className="text-slate-500 font-normal italic">
                  {t.preview.emptyNotice}
                </span>
              )}
            </p>
          </div>

          {/* Decorative avatar speech tail */}
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-900 border-r-2 border-b-2 border-blue-500/40 transform rotate-45" />
        </div>
      </div>

      {/* Overflow Warning */}
      {isOverflow && (
        <div className="flex items-center gap-2 p-2.5 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{t.preview.overflowWarning}</span>
        </div>
      )}

      {/* Live Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-base">{heartEmoji}</span>
            <span className="font-mono text-slate-200">{hrState.bpm > 0 ? `${hrState.bpm} BPM` : '--'}</span>
          </span>
          <span>•</span>
          <span className="truncate max-w-[200px] text-slate-300">
            {mediaState.isPlaying && mediaState.title ? `🎵 ${mediaState.title}` : (lang === 'de' ? 'Keine Musik' : 'No music')}
          </span>
        </div>

        <button
          id="btn-preview-send-now"
          onClick={handleSendNow}
          disabled={isSending}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{t.preview.sendNowBtn}</span>
        </button>
      </div>
    </div>
  );
};
