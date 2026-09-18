import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio,
  Terminal,
  Heart,
  Music,
  Sliders,
  Shield,
  CheckCircle2,
  Cpu,
  Moon,
  MessageSquare,
  Globe,
  Upload,
  Monitor,
} from 'lucide-react';
import {
  ChatboxConfig,
  HeartRateProvider,
  HeartRateState,
  MediaState,
  OscLogEntry,
  ServerStatusResponse,
  AppLanguage,
  ProfileAutomationRule,
} from './types';
import { translations } from './lib/i18n';
import { ChatboxPreview } from './components/ChatboxPreview';
import { HeartRateCard } from './components/HeartRateCard';
import { MediaSourceCard } from './components/MediaSourceCard';
import { ChatboxSettingsCard } from './components/ChatboxSettingsCard';
import { OscNetworkCard } from './components/OscNetworkCard';
import { WindowsGuideModal } from './components/WindowsGuideModal';
import { LinuxGuideModal } from './components/LinuxGuideModal';
import { ConfigMigrateModal } from './components/ConfigMigrateModal';
import { HardwareStatsCard } from './components/HardwareStatsCard';
import { AfkDetectionCard } from './components/AfkDetectionCard';
import { CustomTextsCard } from './components/CustomTextsCard';
import { ProfileAutomationCard } from './components/ProfileAutomationCard';

export default function App() {
  const [config, setConfig] = useState<ChatboxConfig>({
    language: 'en',
    enabled: true,
    template: '💓 {hr} BPM 💓\\n{song}',
    updateIntervalMs: 1500,
    playSound: false,
    bypassTypingIndicator: true,
    marqueeEnabled: false,
    marqueeWidth: 35,
    customStatus: '',
    oscHost: '127.0.0.1',
    oscPort: 9000,
    hyperateSessionId: '',
    pulsoidToken: '',
    autoMediaDetection: true,
    mediaOnlyWhenPlaying: true,
    customTexts: [
      'Welcome to my VRChat instance! ✨',
      'VRChat OSC Hub running smoothly on Windows & Linux',
    ],
    customTextIntervalSec: 10,
    hardwareStatsEnabled: true,
    afkEnabled: true,
    afkMode: 'vrchat_and_timer',
    afkTimeoutMinutes: 5,
    afkTemplate: '💤 AFK [{afk_time}] - Back soon!',
    afkOverrideChatbox: true,
  });

  const currentLang: AppLanguage = config.language || 'en';
  const t = translations[currentLang];

  const [hrState, setHrState] = useState<HeartRateState>({
    bpm: 0,
    provider: 'hyperate',
    connected: false,
    lastUpdated: Date.now(),
    deviceLabel: 'HypeRate (Waiting for Session ID)',
  });

  const [mediaState, setMediaState] = useState<MediaState>({
    title: '',
    artist: '',
    album: '',
    isPlaying: false,
    positionSec: 0,
    durationSec: 0,
    sourceName: 'media/auto',
    lastUpdated: Date.now(),
  });

  const [serverStatus, setServerStatus] = useState<ServerStatusResponse>({
    oscActive: true,
    oscTarget: { host: '127.0.0.1', port: 9000 },
    serverPort: 3000,
    isLinuxMode: false,
    isWindowsMode: true,
    hasHyperateApiKey: true,
    hyperateKeyMasked: 'Pelikan Relay (164.30.71.45:7871)',
    hyperateConnected: false,
    mediaDetectionActive: true,
    currentBpm: 0,
    currentMedia: {
      title: '',
      artist: '',
      isPlaying: false,
      positionSec: 0,
      durationSec: 0,
      sourceName: 'media',
      lastUpdated: Date.now(),
    },
    lastOscText: '',
    packetsSent: 0,
    logs: [],
  });

  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [showLinuxModal, setShowLinuxModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch initial config & live status from backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data: ServerStatusResponse = await res.json();
        setServerStatus(data);
        if (data.hrState) {
          setHrState(data.hrState);
        } else if (data.currentBpm !== undefined && data.currentBpm > 0) {
          setHrState((prev) => ({
            ...prev,
            bpm: data.currentBpm,
            connected: Boolean(data.hyperateConnected || data.pulsoidConnected),
          }));
        }
        if (data.currentMedia) {
          setMediaState(data.currentMedia);
        }
      }
    } catch {}
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        if (data.heartRateProvider) {
          setHrState((prev) => ({
            ...prev,
            provider: data.heartRateProvider,
          }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);
    return () => clearInterval(interval);
  }, [fetchConfig, fetchStatus]);

  // Update Config & Persist to disk
  const handleUpdateConfig = async (updates: Partial<ChatboxConfig>, notifyMessage?: string) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    if (updates.heartRateProvider) {
      setHrState((prev) => ({ ...prev, provider: updates.heartRateProvider! }));
    }
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        if (notifyMessage) {
          showNotification(notifyMessage);
        } else if (updates.enabled !== undefined) {
          showNotification(updates.enabled ? t.notifications.oscStarted : t.notifications.oscStopped);
        }
      }
    } catch (err) {
      console.error('Failed to update config', err);
    }
  };

  // Switch language
  const handleLanguageChange = (newLang: AppLanguage) => {
    handleUpdateConfig(
      { language: newLang },
      newLang === 'de' ? 'Sprache auf Deutsch gestellt 🇩🇪' : 'Language set to English 🇬🇧'
    );
  };

  // Update HR State from Client
  const handleUpdateHrState = async (data: { bpm: number; provider?: HeartRateProvider; deviceLabel?: string }) => {
    setHrState((prev) => ({
      ...prev,
      bpm: data.bpm,
      provider: data.provider || prev.provider,
      deviceLabel: data.deviceLabel || prev.deviceLabel,
      lastUpdated: Date.now(),
    }));
    try {
      await fetch('/api/heart-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  // Update Media State
  const handleUpdateMedia = async (data: Partial<MediaState>) => {
    setMediaState((prev) => ({
      ...prev,
      ...data,
      lastUpdated: Date.now(),
    }));
    try {
      await fetch('/api/media/now-playing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {}
  };

  // Manual OSC send
  const handleSendManual = async (text: string) => {
    try {
      const res = await fetch('/api/send-osc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          bypassTyping: config.bypassTypingIndicator,
          playSound: config.playSound,
        }),
      });
      if (res.ok) {
        showNotification(currentLang === 'de' ? 'OSC an VRChat gesendet' : 'OSC message sent to VRChat');
        fetchStatus();
      }
    } catch {
      showNotification(currentLang === 'de' ? 'Fehler beim Senden' : 'Error sending OSC message');
    }
  };

  const handleSendTestOsc = async () => {
    await handleSendManual(`💓 ${hrState.bpm || 80} BPM\n${mediaState.title ? `🎵 ${mediaState.title}` : ''}`);
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setServerStatus((prev) => ({ ...prev, logs: [] }));
      showNotification(t.oscNetwork.logsClearedNotice);
    } catch {}
  };

  const handleInsertTemplateTag = (tag: string) => {
    const current = config.template || '';
    const updated = current.endsWith(' ') || current.length === 0 ? `${current}${tag}` : `${current} ${tag}`;
    handleUpdateConfig({ template: updated });
    showNotification(currentLang === 'de' ? `Variable ${tag} eingefügt` : `Variable ${tag} inserted`);
  };

  const handleUpdateAutomationRules = async (rules: ProfileAutomationRule[], enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      profileRules: rules,
      profileAutomationEnabled: enabled,
    }));
    try {
      const res = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, enabled }),
      });
      if (res.ok) {
        showNotification(t.profileAutomation.savedNotice);
        fetchStatus();
      }
    } catch {}
  };

  const handleResetAutomationRules = async () => {
    try {
      const res = await fetch('/api/automation/rules/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => ({
          ...prev,
          profileRules: data.profileRules,
          profileAutomationEnabled: true,
        }));
        showNotification(t.profileAutomation.resetNotice);
        fetchStatus();
      }
    } catch {}
  };

  const handleApplyMigratedConfig = async (migratedConfig: ChatboxConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(migratedConfig),
      });
      if (res.ok) {
        const saved = await res.json();
        setConfig(saved.config || saved);
        showNotification(
          currentLang === 'de'
            ? 'Konfiguration erfolgreich konvertiert & angewendet! ✨'
            : 'Configuration successfully converted & applied! ✨'
        );
        fetchStatus();
      }
    } catch {
      showNotification(
        currentLang === 'de' ? 'Fehler beim Speichern der Konfiguration' : 'Failed to save config'
      );
    }
  };

  const isAutomationActive = Boolean(
    config.profileAutomationEnabled ?? config.automationEnabled ?? serverStatus.profileAutomationEnabled
  );

  const effectiveProfileId =
    isAutomationActive && (serverStatus.autoActiveProfileId || serverStatus.computedActiveProfileId)
      ? (serverStatus.autoActiveProfileId || serverStatus.computedActiveProfileId!)
      : (config.activeProfileId || 'profil_3_standard_puls_musik');

  const effectiveTemplate =
    isAutomationActive && serverStatus.effectiveTemplate
      ? serverStatus.effectiveTemplate
      : (config.template || '💓 {hr} BPM 💓\\n{song}');

  const activeProfileName =
    (config.profiles || []).find((p) => p.id === effectiveProfileId)?.name ||
    serverStatus.matchedRuleName;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-wide">{t.header.title}</h1>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  127.0.0.1:9000
                </span>
                {serverStatus.afkState?.isAfk && (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Moon className="w-3 h-3" /> AFK
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {t.header.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800" title={t.header.langSelect}>
              <button
                id="btn-lang-en"
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                id="btn-lang-de"
                type="button"
                onClick={() => handleLanguageChange('de')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentLang === 'de'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🇩🇪</span>
                <span>DE</span>
              </button>
            </div>

            {/* Migrate Config Modal Trigger */}
            <button
              id="btn-header-open-migrate"
              onClick={() => setShowMigrateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 text-xs font-semibold transition-all cursor-pointer border border-teal-500/40 hover:border-teal-400"
              title={currentLang === 'de' ? 'Alte JSON-Konfiguration hochladen & konvertieren' : 'Upload & migrate older JSON config'}
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">{currentLang === 'de' ? 'Config konvertieren' : 'Migrate Config'}</span>
              <span className="sm:hidden">{currentLang === 'de' ? 'Migrieren' : 'Migrate'}</span>
            </button>

            {/* Windows Guide Modal Trigger */}
            <button
              id="btn-open-windows-guide"
              onClick={() => setShowWindowsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer border border-slate-700"
              title={currentLang === 'de' ? 'Windows 10/11 Anleitung' : 'Windows 10/11 Guide'}
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{t.header.windowsGuide}</span>
              <span className="sm:hidden">Windows</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-5 space-y-5">
        {/* Chatbox Preview */}
        <ChatboxPreview
          lang={currentLang}
          template={effectiveTemplate}
          hrState={hrState}
          mediaState={mediaState}
          customStatus={config.customStatus}
          marqueeEnabled={config.marqueeEnabled}
          marqueeWidth={config.marqueeWidth}
          playSound={config.playSound}
          bypassTyping={config.bypassTypingIndicator}
          updateIntervalMs={config.updateIntervalMs}
          isActive={config.enabled}
          hardwareStats={serverStatus.hardwareStats}
          afkState={serverStatus.afkState}
          afkTemplate={config.afkTemplate}
          afkOverrideChatbox={config.afkOverrideChatbox}
          customTexts={config.customTexts}
          currentCustomTextIndex={serverStatus.currentCustomTextIndex}
          mediaOnlyWhenPlaying={config.mediaOnlyWhenPlaying}
          isAutomated={isAutomationActive}
          activeProfileName={activeProfileName}
          onSendManual={handleSendManual}
        />

        {/* 2-Column Responsive App Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Column 1: Heart Rate, Media & Hardware Stats */}
          <div className="space-y-5">
            <HeartRateCard
              lang={currentLang}
              hrState={hrState}
              hyperateSessionId={config.hyperateSessionId}
              hyperateRelayUrl={config.hyperateRelayUrl}
              pulsoidToken={config.pulsoidToken}
              heartRateProvider={config.heartRateProvider || config.hrProvider || hrState.provider}
              hasHyperateApiKey={serverStatus.hasHyperateApiKey}
              hyperateKeyMasked={serverStatus.hyperateKeyMasked}
              hyperateConnected={serverStatus.hyperateConnected}
              pulsoidConnected={serverStatus.pulsoidConnected}
              onUpdateConfig={handleUpdateConfig}
              onUpdateHrState={handleUpdateHrState}
            />

            <MediaSourceCard
              lang={currentLang}
              mediaState={mediaState}
              autoMediaDetection={config.autoMediaDetection}
              mediaOnlyWhenPlaying={config.mediaOnlyWhenPlaying}
              onUpdateMedia={handleUpdateMedia}
              onUpdateConfig={handleUpdateConfig}
              serverPort={serverStatus.serverPort}
            />

            <HardwareStatsCard
              lang={currentLang}
              stats={serverStatus.hardwareStats}
              enabled={config.hardwareStatsEnabled ?? false}
              onToggleEnabled={(enabled) => handleUpdateConfig({ hardwareStatsEnabled: enabled })}
              onInsertVariable={handleInsertTemplateTag}
            />
          </div>

          {/* Column 2: Chatbox Format, Profile Automation, Rotating Texts, AFK & Network */}
          <div className="space-y-5">
            <ChatboxSettingsCard
              lang={currentLang}
              config={config}
              activeProfileId={effectiveProfileId}
              effectiveTemplate={effectiveTemplate}
              isAutomationActive={isAutomationActive}
              matchedRuleName={serverStatus.matchedRuleName}
              onUpdateConfig={handleUpdateConfig}
            />

            <ProfileAutomationCard
              lang={currentLang}
              config={config}
              serverStatus={serverStatus}
              onUpdateRules={handleUpdateAutomationRules}
              onResetRules={handleResetAutomationRules}
            />

            <CustomTextsCard
              lang={currentLang}
              customTexts={config.customTexts ?? []}
              intervalSec={config.customTextIntervalSec ?? 10}
              currentActiveIndex={serverStatus.currentCustomTextIndex ?? 0}
              onUpdateCustomTexts={(texts) => handleUpdateConfig({ customTexts: texts })}
              onUpdateInterval={(sec) => handleUpdateConfig({ customTextIntervalSec: sec })}
              onInsertMainVariable={handleInsertTemplateTag}
            />

            <AfkDetectionCard
              lang={currentLang}
              afkState={serverStatus.afkState}
              enabled={config.afkEnabled ?? false}
              afkMode={config.afkMode ?? 'vrchat_and_timer'}
              timeoutMinutes={config.afkTimeoutMinutes ?? 5}
              template={config.afkTemplate ?? '💤 AFK [{afk_time}] - Back soon!'}
              overrideChatbox={config.afkOverrideChatbox ?? true}
              onUpdateConfig={handleUpdateConfig}
              onInsertMainVariable={handleInsertTemplateTag}
            />

            <OscNetworkCard
              lang={currentLang}
              oscHost={config.oscHost}
              oscPort={config.oscPort}
              packetsSent={serverStatus.packetsSent}
              logs={serverStatus.logs}
              config={config}
              onUpdateTarget={(host, port) => handleUpdateConfig({ oscHost: host, oscPort: port })}
              onSendTest={handleSendTestOsc}
              onClearLogs={handleClearLogs}
              onOpenMigrateModal={() => setShowMigrateModal(true)}
            />
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white shadow-2xl animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Windows Guide Modal */}
      <WindowsGuideModal
        isOpen={showWindowsModal}
        onClose={() => setShowWindowsModal(false)}
        serverPort={serverStatus.serverPort}
      />

      {/* Linux Guide Modal */}
      <LinuxGuideModal
        lang={currentLang}
        isOpen={showLinuxModal}
        onClose={() => setShowLinuxModal(false)}
        serverPort={serverStatus.serverPort}
      />

      {/* Config Migrate & Import Modal */}
      <ConfigMigrateModal
        lang={currentLang}
        isOpen={showMigrateModal}
        onClose={() => setShowMigrateModal(false)}
        onApplyMigratedConfig={handleApplyMigratedConfig}
      />
    </div>
  );
}
