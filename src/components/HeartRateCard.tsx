import React, { useState, useEffect } from 'react';
import { Heart, Activity, CheckCircle2, Bluetooth, Sliders, ExternalLink, X, AlertCircle } from 'lucide-react';
import { HeartRateProvider, HeartRateState, AppLanguage } from '../types';
import { getBpmZoneName, getHeartIcon } from '../lib/formatter';
import { translations } from '../lib/i18n';

interface HeartRateCardProps {
  lang?: AppLanguage;
  hrState: HeartRateState;
  hyperateSessionId: string;
  hyperateRelayUrl?: string;
  pulsoidToken: string;
  heartRateProvider?: HeartRateProvider;
  hasHyperateApiKey: boolean;
  hyperateKeyMasked: string;
  hyperateConnected: boolean;
  pulsoidConnected?: boolean;
  onUpdateConfig: (data: {
    hyperateSessionId?: string;
    hyperateRelayUrl?: string;
    pulsoidToken?: string;
    heartRateProvider?: HeartRateProvider;
  }) => void;
  onUpdateHrState: (data: { bpm: number; provider?: HeartRateProvider; deviceLabel?: string }) => void;
}

export const HeartRateCard: React.FC<HeartRateCardProps> = ({
  lang = 'en',
  hrState,
  hyperateSessionId,
  hyperateRelayUrl = '',
  pulsoidToken,
  heartRateProvider,
  hasHyperateApiKey,
  hyperateKeyMasked,
  hyperateConnected,
  pulsoidConnected = false,
  onUpdateConfig,
  onUpdateHrState,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<HeartRateProvider>(
    heartRateProvider || hrState.provider || 'hyperate'
  );
  const [sessionIdInput, setSessionIdInput] = useState(hyperateSessionId || '');
  const [pulsoidInput, setPulsoidInput] = useState(pulsoidToken || '');
  const [relayUrlInput, setRelayUrlInput] = useState(hyperateRelayUrl || '');
  const [showRelaySettings, setShowRelaySettings] = useState(Boolean(hyperateRelayUrl));
  const [isConnectingBle, setIsConnectingBle] = useState(false);
  const [bleError, setBleError] = useState<string | null>(null);
  const [pulsoidSavedNotice, setPulsoidSavedNotice] = useState(false);
  const [hyperateSavedNotice, setHyperateSavedNotice] = useState(false);

  useEffect(() => {
    if (heartRateProvider && heartRateProvider !== activeTab) {
      setActiveTab(heartRateProvider);
    }
  }, [heartRateProvider]);

  useEffect(() => {
    if (hyperateSessionId !== undefined && hyperateSessionId !== sessionIdInput) {
      setSessionIdInput(hyperateSessionId);
    }
  }, [hyperateSessionId]);

  useEffect(() => {
    if (pulsoidToken !== undefined && pulsoidToken !== pulsoidInput) {
      setPulsoidInput(pulsoidToken);
    }
  }, [pulsoidToken]);

  useEffect(() => {
    if (hyperateRelayUrl !== undefined && hyperateRelayUrl !== relayUrlInput) {
      setRelayUrlInput(hyperateRelayUrl);
    }
  }, [hyperateRelayUrl]);

  const handleTabChange = (tab: HeartRateProvider) => {
    setActiveTab(tab);
    onUpdateConfig({ heartRateProvider: tab });
    onUpdateHrState({
      bpm: hrState.bpm,
      provider: tab,
      deviceLabel: tab === 'pulsoid' ? 'Pulsoid Feed' : tab === 'hyperate' ? 'HypeRate' : tab,
    });
  };

  const handleSaveHyperate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSession = sessionIdInput.trim();
    const cleanRelay = relayUrlInput.trim();
    onUpdateConfig({
      hyperateSessionId: cleanSession,
      hyperateRelayUrl: cleanRelay,
      heartRateProvider: 'hyperate',
    });
    onUpdateHrState({
      bpm: hrState.bpm,
      provider: 'hyperate',
      deviceLabel: cleanRelay ? `Pelikan Relay (${cleanSession})` : `HypeRate (${cleanSession})`,
    });
    setActiveTab('hyperate');
    setHyperateSavedNotice(true);
    setTimeout(() => setHyperateSavedNotice(false), 3000);
  };

  const handleSavePulsoid = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = pulsoidInput.trim();
    onUpdateConfig({
      pulsoidToken: cleanToken,
      heartRateProvider: 'pulsoid',
    });
    onUpdateHrState({
      bpm: hrState.bpm,
      provider: 'pulsoid',
      deviceLabel: cleanToken ? 'Pulsoid Feed' : 'Pulsoid (Kein Token)',
    });
    setActiveTab('pulsoid');
    setPulsoidSavedNotice(true);
    setTimeout(() => setPulsoidSavedNotice(false), 3000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateHrState({ bpm: val, provider: 'manual', deviceLabel: 'Simulator Slider' });
  };

  // Web Bluetooth LE connect (Standard 0x180D Heart Rate Service)
  const connectBluetoothLE = async () => {
    setBleError(null);
    const navBluetooth = (navigator as any).bluetooth;
    if (!navBluetooth) {
      setBleError(lang === 'de' ? 'Web Bluetooth wird von diesem Browser nicht unterstützt. Verwende Google Chrome oder Edge.' : 'Web Bluetooth is not supported in this browser. Use Google Chrome or Edge.');
      return;
    }
    try {
      setIsConnectingBle(true);
      const device = await navBluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('heart_rate');
      const characteristic = await service?.getCharacteristic('heart_rate_measurement');
      await characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let bpm = 0;
        if ((flags & 0x01) === 0) {
          bpm = value.getUint8(1);
        } else {
          bpm = value.getUint16(1, true);
        }
        onUpdateHrState({
          bpm,
          provider: 'bluetooth',
          deviceLabel: device.name || 'Bluetooth Heart Monitor',
        });
      });
      onUpdateHrState({
        bpm: hrState.bpm || 70,
        provider: 'bluetooth',
        deviceLabel: device.name || 'Bluetooth Smart Device',
      });
      setIsConnectingBle(false);
    } catch (err: any) {
      setIsConnectingBle(false);
      if (err.name !== 'NotFoundError') {
        setBleError(err.message || (lang === 'de' ? 'Verbindung fehlgeschlagen' : 'Connection failed'));
      }
    }
  };

  const currentZone = getBpmZoneName(hrState.bpm, lang);

  return (
    <div id="card-heart-rate" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.heartRate.title}
              {hrState.bpm > 0 && (
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {currentZone}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">{t.heartRate.subtitle}</p>
          </div>
        </div>

        {/* Live BPM Badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-lg">{getHeartIcon(hrState.bpm)}</span>
          <div className="flex flex-col text-right leading-none">
            <span className="text-lg font-bold font-mono text-white">{hrState.bpm > 0 ? hrState.bpm : '--'}</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider">BPM</span>
          </div>
        </div>
      </div>

      {/* Provider Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800/80">
        <button
          id="tab-hr-hyperate"
          type="button"
          onClick={() => handleTabChange('hyperate')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'hyperate'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.heartRate.tabs.hyperate}
        </button>
        <button
          id="tab-hr-pulsoid"
          type="button"
          onClick={() => handleTabChange('pulsoid')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'pulsoid'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.heartRate.tabs.pulsoid}
        </button>
        <button
          id="tab-hr-bluetooth"
          type="button"
          onClick={() => handleTabChange('bluetooth')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'bluetooth'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.heartRate.tabs.ble}
        </button>
        <button
          id="tab-hr-manual"
          type="button"
          onClick={() => handleTabChange('manual')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          {t.heartRate.tabs.sim}
        </button>
      </div>

      {/* Tab: HypeRate */}
      {activeTab === 'hyperate' && (
        <form onSubmit={handleSaveHyperate} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              {t.heartRate.hyperate.sessionLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="input-hyperate-session"
                type="text"
                placeholder={t.heartRate.hyperate.sessionPlaceholder}
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                id="btn-save-hyperate"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {t.heartRate.hyperate.connectBtn}
              </button>
            </div>
          </div>

          {/* Relay Server Toggle & Field */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowRelaySettings(!showRelaySettings)}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>{showRelaySettings ? '▼' : '▶'} {t.heartRate.hyperate.relayServerLabel}</span>
            </button>
            {showRelaySettings && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Relay WebSocket URL:
                  </label>
                  {relayUrlInput ? (
                    <button
                      type="button"
                      onClick={() => setRelayUrlInput('')}
                      className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      {lang === 'de' ? 'Auf Standard zurücksetzen' : 'Reset to Default'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ✓ {lang === 'de' ? 'Standard-Server aktiv (Geschützt)' : 'Default Relay Active (Protected)'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={t.heartRate.hyperate.relayPlaceholder}
                  value={relayUrlInput}
                  onChange={(e) => setRelayUrlInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  {t.heartRate.hyperate.relayNotice}
                </p>
              </div>
            )}
          </div>

          {hyperateSavedNotice && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'de' ? 'HypeRate Session gespeichert & verbunden!' : 'HypeRate session saved & connected!'}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              {hyperateConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Activity className="w-4 h-4 text-slate-400 animate-pulse" />
              )}
              <span className="text-slate-300 font-medium">Status:</span>
              <span className={hyperateConnected ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                {hyperateConnected
                  ? `${t.common.connected} (Session: ${hyperateSessionId || sessionIdInput})`
                  : sessionIdInput
                  ? t.heartRate.hyperate.connecting
                  : (lang === 'de' ? 'Keine Session eingetragen' : 'No Session ID entered')}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Key: {hyperateKeyMasked}
            </span>
          </div>
        </form>
      )}

      {/* Tab: Pulsoid */}
      {activeTab === 'pulsoid' && (
        <form onSubmit={handleSavePulsoid} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                {t.heartRate.pulsoid.tokenLabel}
              </label>
              <a
                href="https://pulsoid.net/ui/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>{t.heartRate.pulsoid.tokenLink}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input
                  id="input-pulsoid-token"
                  type="text"
                  placeholder={t.heartRate.pulsoid.tokenPlaceholder}
                  value={pulsoidInput}
                  onChange={(e) => setPulsoidInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pr-8 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                {pulsoidInput && (
                  <button
                    type="button"
                    onClick={() => setPulsoidInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                    title="Clear"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                id="btn-save-pulsoid"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                {t.common.save}
              </button>
            </div>
          </div>

          {pulsoidSavedNotice && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.heartRate.pulsoid.savedNotification}</span>
            </div>
          )}

          {/* Pulsoid Status Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              {pulsoidConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : pulsoidInput ? (
                <Activity className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
              ) : (
                <Activity className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-slate-300 font-medium">Status:</span>
              <span className={pulsoidConnected ? 'text-emerald-400 font-medium' : pulsoidInput ? 'text-blue-400' : 'text-slate-400'}>
                {pulsoidConnected
                  ? `${t.heartRate.pulsoid.statusConnected}`
                  : pulsoidInput
                  ? (hrState.error && hrState.provider === 'pulsoid' ? hrState.error : t.heartRate.pulsoid.statusConnecting)
                  : t.heartRate.pulsoid.noTokenEntered}
              </span>
            </div>
            {hrState.bpm > 0 && hrState.provider === 'pulsoid' && (
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {hrState.bpm} BPM
              </span>
            )}
          </div>

          {hrState.error && hrState.provider === 'pulsoid' && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{hrState.error}</span>
            </div>
          )}

          {/* Helpful Help Box */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-400 space-y-1.5">
            <p className="leading-relaxed text-slate-300">
              {t.heartRate.pulsoid.tokenHelp}
            </p>
            <p className="text-[11px] text-slate-500 leading-normal">
              {lang === 'de'
                ? '💡 Unterstützt Access-Tokens oder Feed-URLs (z.B. wss://dev.pulsoid.net/api/v1/data/real_time?access_token=... oder Widget-URLs). Der Pelikan Hub bleibt dauerhaft verbunden und streamt den Puls per OSC an VRChat.'
                : '💡 Supports Access Tokens or Feed URLs (e.g. wss://dev.pulsoid.net/api/v1/data/real_time?access_token=... or widget URLs). Pelikan Hub stays permanently connected and streams heart rate to VRChat via OSC.'}
            </p>
          </div>
        </form>
      )}

      {/* Tab: Bluetooth LE */}
      {activeTab === 'bluetooth' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">{t.heartRate.ble.title}</div>
              <div className="text-[11px] text-slate-400">{t.heartRate.ble.desc}</div>
            </div>
            <button
              id="btn-connect-ble"
              type="button"
              disabled={isConnectingBle}
              onClick={connectBluetoothLE}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Bluetooth className="w-3.5 h-3.5" />
              {isConnectingBle ? (lang === 'de' ? 'Suche...' : 'Scanning...') : t.heartRate.ble.connectBtn}
            </button>
          </div>
          {bleError && <div className="text-xs text-rose-400 p-2 rounded bg-rose-950/40 border border-rose-900/40">{bleError}</div>}
        </div>
      )}

      {/* Tab: Simulator */}
      {activeTab === 'manual' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>{t.heartRate.sim.sliderLabel}:</span>
            <span className="font-bold text-rose-400 font-mono text-sm">{hrState.bpm} BPM</span>
          </div>
          <input
            id="slider-bpm-test"
            type="range"
            min="40"
            max="200"
            value={hrState.bpm || 70}
            onChange={handleSliderChange}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
