import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { exec, spawn } from 'child_process';
import dgram from 'dgram';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { encodeVRChatChatboxInput, decodeOscPackets } from './src/lib/osc';
import { formatChatboxMessage } from './src/lib/formatter';
import {
  AfkState,
  ChatboxConfig,
  ChatboxProfile,
  HardwareStats,
  HeartRateState,
  MediaState,
  OscLogEntry,
  ProfileAutomationRule,
  ProviderHeartRateState,
  ServerStatusResponse,
} from './src/types';

// Prevent unhandled errors from crashing the Node.js server process
process.on('uncaughtException', (err: Error) => {
  console.warn('[Server Warn] Uncaught Exception abgefangen:', err.message);
});
process.on('unhandledRejection', (reason: any) => {
  console.warn('[Server Warn] Unhandled Rejection abgefangen:', reason);
});

// Load environment variables from .env file (kept out of git/codebase)
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

// Default built-in profiles / format templates
const DEFAULT_PROFILES: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profile 1: Music Only (No Heart Rate)',
    description: 'Displays current song & clock, no heart rate',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profile 2: Minimal (No HR & No Media)',
    description: 'No heart rate or music, status text & clock only',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profile 3: Standard (HR & Music)',
    description: 'Classic 2-line layout with heart rate & music',
    template: '💓 {hr} BPM 💓\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profile 4: Heart Rate Only',
    description: 'Pure heart rate display with animated heart icon',
    template: '💓 {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_hardware_afk',
    name: 'Profile 5: Hardware & AFK',
    description: 'CPU & RAM telemetry and automatic AFK duration timer',
    template: '💻 {hw} | 💤 {afk_time}',
    isBuiltIn: true,
  },
  {
    id: 'profil_6_full_hud',
    name: 'Profile 6: Full HUD (Everything)',
    description: 'Heart rate, music, hardware monitor & rotating custom texts',
    template: '💓 {hr} BPM 🎵 {song}\\n💻 {cpu} / {ram} 💬 {freitext}',
    isBuiltIn: true,
  },
];

// Default profile automation rules
export const DEFAULT_PROFILE_RULES: ProfileAutomationRule[] = [
  {
    id: 'rule_music_no_hr',
    name: 'Wenn Puls = Aus & Musik = An ➔ Profil 1 (Nur Musik)',
    enabled: true,
    targetProfileId: 'profil_1_nur_musik',
    conditions: {
      heartRate: 'false',
      media: 'true',
      afk: 'any',
    },
  },
  {
    id: 'rule_hr_and_music',
    name: 'Wenn Puls = An & Musik = An ➔ Profil 3 (Standard Puls & Musik)',
    enabled: true,
    targetProfileId: 'profil_3_standard_puls_musik',
    conditions: {
      heartRate: 'true',
      media: 'true',
      afk: 'any',
    },
  },
  {
    id: 'rule_hr_only',
    name: 'Wenn Puls = An & Musik = Aus ➔ Profil 4 (Nur Puls)',
    enabled: true,
    targetProfileId: 'profil_4_nur_puls',
    conditions: {
      heartRate: 'true',
      media: 'false',
      afk: 'any',
    },
  },
  {
    id: 'rule_minimal_idle',
    name: 'Wenn Puls = Aus & Musik = Aus ➔ Profil 2 (Minimal / Freitext)',
    enabled: true,
    targetProfileId: 'profil_2_minimal_kein_puls_keine_medien',
    conditions: {
      heartRate: 'false',
      media: 'false',
      afk: 'any',
    },
  },
  {
    id: 'rule_afk_active',
    name: 'Wenn AFK = An ➔ Profil 5 (Hardware & AFK)',
    enabled: false,
    targetProfileId: 'profil_5_hardware_afk',
    conditions: {
      heartRate: 'any',
      media: 'any',
      afk: 'true',
    },
  },
];

// Resolve optional local HypeRate API Key safely from environment:
function resolveHyperateApiKey(): string {
  const envKey = process.env.HYPERATE_API_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  return '';
}

const HYPERATE_API_KEY = resolveHyperateApiKey();
export const DEFAULT_PELIKAN_RELAY = process.env.HYPERATE_DEFAULT_RELAY || 'ws://164.30.71.45:7871';

// File for persisting settings on Windows / Linux
const CONFIG_FILE_PATH = path.join(process.cwd(), 'chatbox-config.json');

// Default configuration
const currentConfig: ChatboxConfig = {
  enabled: true,
  template: '💓 {hr} BPM 💓\\n{song}',
  updateIntervalMs: 1500,
  playSound: false,
  bypassTypingIndicator: true,
  marqueeEnabled: false,
  marqueeWidth: 35,
  customStatus: '',
  oscHost: process.env.VRCHAT_OSC_HOST || '127.0.0.1',
  oscPort: Number(process.env.VRCHAT_OSC_PORT) || 9000,
  hyperateSessionId: '',
  hyperateRelayUrl: '',
  pulsoidToken: '',
  heartRateProvider: 'hyperate',
  autoMediaDetection: true,
  mediaOnlyWhenPlaying: true,
  profiles: DEFAULT_PROFILES,
  activeProfileId: 'profil_3_standard_puls_musik',
  profileAutomationEnabled: false,
  profileRules: DEFAULT_PROFILE_RULES,
  hardwareStatsEnabled: true,
  afkEnabled: true,
  afkMode: 'vrchat_and_timer',
  afkTimeoutMinutes: 5,
  afkTemplate: '💤 AFK [{afk_time}] - Back soon!',
  afkOverrideChatbox: true,
  customTexts: [
    'Welcome to my VRChat instance! ✨',
    'VRChat OSC Hub running smoothly on Windows & Linux',
  ],
  customTextIntervalSec: 10,
};

// Distinct, independent Heart Rate provider states (never overwrite each other)
const hyperateState: ProviderHeartRateState = {
  bpm: 0,
  connected: false,
  lastUpdated: 0,
  deviceLabel: 'HypeRate (Warte auf Verbindung)',
};

const pulsoidState: ProviderHeartRateState = {
  bpm: 0,
  connected: false,
  lastUpdated: 0,
  deviceLabel: 'Pulsoid Feed (Warte auf Verbindung)',
};

const bluetoothState: ProviderHeartRateState = {
  bpm: 0,
  connected: false,
  lastUpdated: 0,
  deviceLabel: 'Bluetooth BLE (Warte auf Verbindung)',
};

// Get the currently active effective Heart Rate state
function getEffectiveHeartRateState(): HeartRateState {
  const provider = currentConfig.heartRateProvider || currentConfig.hrProvider || 'hyperate';

  if (provider === 'pulsoid') {
    return {
      bpm: pulsoidState.bpm,
      connected: pulsoidState.connected,
      lastUpdated: pulsoidState.lastUpdated,
      deviceLabel: pulsoidState.deviceLabel,
      error: pulsoidState.error,
      provider: 'pulsoid',
    };
  }

  if (provider === 'bluetooth') {
    return {
      bpm: bluetoothState.bpm,
      connected: bluetoothState.connected,
      lastUpdated: bluetoothState.lastUpdated,
      deviceLabel: bluetoothState.deviceLabel,
      battery: bluetoothState.battery,
      error: bluetoothState.error,
      provider: 'bluetooth',
    };
  }

  // Default: hyperate
  return {
    bpm: hyperateState.bpm,
    connected: hyperateState.connected,
    lastUpdated: hyperateState.lastUpdated,
    deviceLabel: hyperateState.deviceLabel,
    error: hyperateState.error,
    provider: 'hyperate',
  };
}

// Evaluate Profile Automation Rules against live conditions
function evaluateProfileRules(): {
  profileId: string;
  template: string;
  matchedRule?: ProfileAutomationRule;
  hrActive: boolean;
  mediaActive: boolean;
  afkActive: boolean;
} {
  const effectiveHr = getEffectiveHeartRateState();
  const HR_TIMEOUT_MS = 20000; // 20 Sekunden ohne Aktualisierung = Inaktiv für Automatisierung
  const isHrFresh = Boolean(
    effectiveHr.connected &&
    effectiveHr.bpm > 0 &&
    effectiveHr.lastUpdated > 0 &&
    (Date.now() - effectiveHr.lastUpdated) < HR_TIMEOUT_MS
  );
  const hrActive = isHrFresh;
  const mediaActive = Boolean(mediaState.isPlaying && (mediaState.title || mediaState.artist));
  const afkActive = Boolean(afkState.isAfk);

  const isEnabled = currentConfig.profileAutomationEnabled ?? currentConfig.automationEnabled ?? false;
  const rules = currentConfig.profileRules ?? currentConfig.automationRules ?? [];

  if (!isEnabled || rules.length === 0) {
    const activeP =
      (currentConfig.profiles || DEFAULT_PROFILES).find(
        (p) => p.id === currentConfig.activeProfileId
      ) || DEFAULT_PROFILES[2] || DEFAULT_PROFILES[0];

    return {
      profileId: activeP.id,
      template: currentConfig.template || activeP.template,
      hrActive,
      mediaActive,
      afkActive,
    };
  }

  for (const rule of rules) {
    if (!rule.enabled) continue;

    // Conditions format support
    const cond = rule.conditions;
    if (cond) {
      const hrMatch =
        cond.heartRate === 'any'
          ? true
          : cond.heartRate === 'true'
          ? hrActive
          : !hrActive;

      const mediaMatch =
        cond.media === 'any'
          ? true
          : cond.media === 'true'
          ? mediaActive
          : !mediaActive;

      const afkMatch =
        !cond.afk || cond.afk === 'any'
          ? true
          : cond.afk === 'true'
          ? afkActive
          : !afkActive;

      if (hrMatch && mediaMatch && afkMatch) {
        const targetP = (currentConfig.profiles || DEFAULT_PROFILES).find(
          (p) => p.id === rule.targetProfileId
        );
        if (targetP) {
          return {
            profileId: targetP.id,
            template: targetP.template,
            matchedRule: rule,
            hrActive,
            mediaActive,
            afkActive,
          };
        }
      }
    }
  }

  // Fallback to activeProfileId
  const fallbackP =
    (currentConfig.profiles || DEFAULT_PROFILES).find(
      (p) => p.id === currentConfig.activeProfileId
    ) || DEFAULT_PROFILES[2] || DEFAULT_PROFILES[0];

  return {
    profileId: fallbackP.id,
    template: fallbackP.template,
    hrActive,
    mediaActive,
    afkActive,
  };
}

// Load persisted settings from disk
function loadPersistedConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      Object.assign(currentConfig, parsed);

      if (!currentConfig.profiles || currentConfig.profiles.length === 0) {
        currentConfig.profiles = [...DEFAULT_PROFILES];
      }
      if (!currentConfig.profileRules || currentConfig.profileRules.length === 0) {
        currentConfig.profileRules = [...DEFAULT_PROFILE_RULES];
      }
      if (!currentConfig.heartRateProvider) {
        if (currentConfig.pulsoidToken && !currentConfig.hyperateSessionId) {
          currentConfig.heartRateProvider = 'pulsoid';
        } else {
          currentConfig.heartRateProvider = 'hyperate';
        }
      }
      console.log('[Config] Gespeicherte Einstellungen geladen');
    }
  } catch (err: any) {
    console.warn('[Config] Konnte gespeicherte Einstellungen nicht laden:', err.message);
  }
}

// Save config to disk
function savePersistedConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(currentConfig, null, 2), 'utf-8');
    console.log('[Config] Einstellungen gespeichert in:', CONFIG_FILE_PATH);
  } catch (err: any) {
    console.warn('[Config] Fehler beim Speichern der Einstellungen:', err.message);
  }
}

// Current Live State
const hrState: HeartRateState = {
  bpm: 0,
  provider: 'hyperate',
  connected: false,
  lastUpdated: Date.now(),
  deviceLabel: 'HypeRate (Warte auf Verbindung)',
};

const mediaState: MediaState = {
  title: '',
  artist: '',
  album: '',
  isPlaying: false,
  positionSec: 0,
  durationSec: 0,
  sourceName: process.platform === 'win32' ? 'Windows Media' : 'playerctl/auto',
  lastUpdated: Date.now(),
};

// Hardware Stats State & Calculations
const hardwareStats: HardwareStats = {
  enabled: true,
  cpuPercent: 0,
  ramPercent: 0,
  ramUsedGb: 0,
  ramTotalGb: 0,
  lastUpdated: Date.now(),
};

let lastCpuTotal = 0;
let lastCpuIdle = 0;

function updateHardwareStats() {
  try {
    // CPU % calculation from os.cpus()
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      let totalTick = 0;
      let totalIdle = 0;
      for (const cpu of cpus) {
        for (const type in cpu.times) {
          totalTick += (cpu.times as any)[type];
        }
        totalIdle += cpu.times.idle;
      }
      const idleDelta = totalIdle - lastCpuIdle;
      const totalDelta = totalTick - lastCpuTotal;
      lastCpuIdle = totalIdle;
      lastCpuTotal = totalTick;
      if (totalDelta > 0) {
        hardwareStats.cpuPercent = Math.max(0, Math.min(100, Math.round((1 - idleDelta / totalDelta) * 100)));
      }
    }

    // RAM calculation
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    hardwareStats.ramPercent = Math.max(0, Math.min(100, Math.round((used / total) * 100)));
    hardwareStats.ramUsedGb = Number((used / (1024 * 1024 * 1024)).toFixed(1));
    hardwareStats.ramTotalGb = Number((total / (1024 * 1024 * 1024)).toFixed(1));

    // Optional CPU Temp read on Linux
    try {
      if (fs.existsSync('/sys/class/thermal/thermal_zone0/temp')) {
        const rawTemp = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf-8');
        const numTemp = parseInt(rawTemp.trim(), 10);
        if (!isNaN(numTemp) && numTemp > 0) {
          hardwareStats.cpuTemp = Math.round(numTemp > 1000 ? numTemp / 1000 : numTemp);
        }
      }
    } catch {}

    hardwareStats.lastUpdated = Date.now();
  } catch (err: any) {
    console.warn('[Hardware Stats] Fehler:', err.message);
  }
}

// Check GPU stats periodically via nvidia-smi if available on Windows or Linux
let gpuCheckTimer: NodeJS.Timeout | null = null;
function startGpuMonitoring() {
  if (gpuCheckTimer) clearInterval(gpuCheckTimer);
  gpuCheckTimer = setInterval(() => {
    if (!currentConfig.hardwareStatsEnabled) return;

    exec('nvidia-smi --query-gpu=utilization.gpu,temperature.gpu --format=csv,noheader,nounits', { timeout: 1500 }, (err, stdout) => {
      if (!err && stdout) {
        const parts = stdout.trim().split(',');
        if (parts.length >= 2) {
          const gpuPct = parseInt(parts[0].trim(), 10);
          const gpuTmp = parseInt(parts[1].trim(), 10);
          if (!isNaN(gpuPct)) hardwareStats.gpuPercent = gpuPct;
          if (!isNaN(gpuTmp)) hardwareStats.gpuTemp = gpuTmp;
        }
      }
    });
  }, 4000);
}

// AFK Detection State
const afkState: AfkState = {
  isAfk: false,
  afkStartTime: null,
  afkDurationSec: 0,
  source: 'none',
  lastActivityTime: Date.now(),
  lastMovementTime: Date.now(),
};

function handleAfkChange(isAfk: boolean, source: 'vrchat_osc' | 'timer' | 'manual' | 'vrchat_movement' | 'none') {
  if (isAfk && !afkState.isAfk) {
    afkState.isAfk = true;
    afkState.afkStartTime = Date.now();
    afkState.afkDurationSec = 0;
    afkState.source = source;
    console.log(`[AFK] Aktiviert via ${source}`);
  } else if (!isAfk && afkState.isAfk) {
    afkState.isAfk = false;
    afkState.afkStartTime = null;
    afkState.afkDurationSec = 0;
    afkState.source = 'none';
    afkState.lastActivityTime = Date.now();
    console.log(`[AFK] Beendet (durch ${source})`);
  }
}

// Automatically called whenever VRChat sends avatar movement, controller inputs or speech
function handleMovementDetected() {
  const now = Date.now();
  afkState.lastActivityTime = now;
  afkState.lastMovementTime = now;
  // If user was AFK, moving in-game turns AFK off automatically!
  if (afkState.isAfk) {
    handleAfkChange(false, 'vrchat_movement');
  }
}

// Rotating Freitexte State
let currentCustomTextIndex = 0;
let lastCustomTextSwitchTime = Date.now();

// OSC Stats and Logs
let packetsSentCount = 0;
let lastSentText = '';
let currentTick = 0;
const oscLogs: OscLogEntry[] = [];

function addLog(address: string, text: string, bytes: number, success: boolean, error?: string) {
  const entry: OscLogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    address,
    text,
    bytes,
    success,
    error,
  };
  oscLogs.unshift(entry);
  if (oscLogs.length > 50) {
    oscLogs.pop();
  }
}

// UDP Socket for sending OSC to VRChat (Port 9000)
const udpSocket = dgram.createSocket('udp4');
udpSocket.on('error', (err) => {
  console.warn('[VRChat OSC] UDP Socket Warning:', err.message);
});

// UDP Socket for receiving OSC from VRChat (Port 9001 - Avatar parameters like AFK & Velocity)
let vrchatIncomingSocket: dgram.Socket | null = null;
function startVRChatOscListener() {
  try {
    const s = dgram.createSocket('udp4');
    vrchatIncomingSocket = s;
    s.on('message', (msg: Buffer) => {
      // VRChat often bundles multiple avatar parameter updates in OSC #bundle packets
      const packets = decodeOscPackets(msg);
      for (const packet of packets) {
        const addr = packet.address;
        const addrLower = addr.toLowerCase();

        // 1. Direct VRChat Avatar AFK parameter (/avatar/parameters/AFK or /avatar/parameters/Afk)
        if (addrLower === '/avatar/parameters/afk') {
          const val = packet.args[0];
          const isAfk = Boolean(val === true || val === 1 || (typeof val === 'number' && val > 0.5));
          if (isAfk) {
            handleAfkChange(true, 'vrchat_osc');
          } else {
            handleAfkChange(false, 'vrchat_osc');
          }
          continue;
        }

        // 2. Avatar Movement & Velocity parameters (VelocityX, VelocityY, VelocityZ, Speed, AngularY)
        if (
          addrLower === '/avatar/parameters/velocityx' ||
          addrLower === '/avatar/parameters/velocityy' ||
          addrLower === '/avatar/parameters/velocityz' ||
          addrLower === '/avatar/parameters/speed' ||
          addrLower === '/avatar/parameters/angulary'
        ) {
          const speedVal = Math.abs(Number(packet.args[0]) || 0);
          if (speedVal > 0.02) {
            handleMovementDetected();
          }
          continue;
        }

        // 3. Player Inputs (Joystick / WASD / Run / Jump / Look)
        if (
          addrLower.startsWith('/input/vertical') ||
          addrLower.startsWith('/input/horizontal') ||
          addrLower.startsWith('/input/look') ||
          addrLower.startsWith('/input/move') ||
          addrLower.startsWith('/input/run') ||
          addrLower.startsWith('/input/jump')
        ) {
          const inputVal = Math.abs(Number(packet.args[0]) || 0);
          if (inputVal > 0.01 || packet.args[0] === true || packet.args[0] === 1) {
            handleMovementDetected();
          }
          continue;
        }

        // 4. Voice / Microphone activity
        if (addrLower === '/avatar/parameters/voice') {
          if (Number(packet.args[0]) > 0.04) {
            handleMovementDetected();
          }
          continue;
        }

        // 5. Head / Tracker Tracking movement
        if (addrLower.startsWith('/tracking/')) {
          handleMovementDetected();
          continue;
        }
      }
    });

    s.on('error', (err) => {
      console.warn('[VRChat Ingress OSC] UDP Port 9001 Notice:', err.message);
    });

    s.bind(9001, '0.0.0.0', () => {
      console.log('[VRChat Ingress OSC] Empfängt VRChat-Avatar-Signale, AFK & Bewegung auf UDP 9001');
    });
  } catch (err: any) {
    console.warn('[VRChat Ingress OSC] Konnte Port 9001 nicht initialisieren:', err.message);
  }
}

export function sendOscToVRChat(
  text: string,
  bypassTyping = true,
  playSound = false
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const packet = encodeVRChatChatboxInput(text, bypassTyping, playSound);
      const buffer = Buffer.from(packet.buffer, packet.byteOffset, packet.byteLength);
      udpSocket.send(buffer, 0, buffer.length, currentConfig.oscPort, currentConfig.oscHost, (err) => {
        if (err) {
          console.error(`[VRChat OSC] Fehler beim Senden an ${currentConfig.oscHost}:${currentConfig.oscPort}`, err.message);
          addLog('/chatbox/input', text, buffer.length, false, err.message);
          resolve(false);
        } else {
          packetsSentCount++;
          lastSentText = text;
          addLog('/chatbox/input', text, buffer.length, true);
          resolve(true);
        }
      });
    } catch (e: any) {
      addLog('/chatbox/input', text, 0, false, e.message);
      resolve(false);
    }
  });
}

// HypeRate WebSocket Manager
let hyperateWs: WebSocket | null = null;
let hyperatePingTimer: NodeJS.Timeout | null = null;
let hyperateConnectDebounce: NodeJS.Timeout | null = null;

function scheduleConnectHyperate(sessionId: string, customRelayUrl?: string) {
  if (hyperateConnectDebounce) {
    clearTimeout(hyperateConnectDebounce);
  }
  hyperateConnectDebounce = setTimeout(() => {
    connectHyperate(sessionId, customRelayUrl);
  }, 350);
}

function connectHyperate(sessionId: string, customRelayUrl?: string) {
  const cleanSessionId = (sessionId || '').trim();
  const userCustomRelay = (customRelayUrl || currentConfig.hyperateRelayUrl || '').trim();

  if (hyperateWs) {
    const oldWs = hyperateWs;
    hyperateWs = null;
    try {
      oldWs.on('error', () => {});
      oldWs.removeAllListeners('close');
      oldWs.removeAllListeners('message');
      if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
        oldWs.close();
      }
    } catch (_) {}
  }

  if (hyperatePingTimer) {
    clearInterval(hyperatePingTimer);
    hyperatePingTimer = null;
  }

  if (!cleanSessionId) {
    hyperateState.connected = false;
    hyperateState.deviceLabel = 'Keine HypeRate Session ID';
    return;
  }

  let targetWsUrl = DEFAULT_PELIKAN_RELAY;
  if (userCustomRelay && userCustomRelay.trim()) {
    let cleanRelay = userCustomRelay.trim();
    if (!cleanRelay.startsWith('ws://') && !cleanRelay.startsWith('wss://')) {
      cleanRelay = `ws://${cleanRelay}`;
    }
    targetWsUrl = cleanRelay;
  }

  const relayLabel = targetWsUrl.includes('164.30.71.45')
    ? 'Pelikan Server (164.30.71.45:7871)'
    : `Relay (${targetWsUrl})`;

  console.log(`[HypeRate] Verbinde mit ${targetWsUrl} (Session: ${cleanSessionId})...`);

  try {
    const ws = new WebSocket(targetWsUrl, { handshakeTimeout: 8000 });
    hyperateWs = ws;

    ws.on('error', (err) => {
      console.warn(`[HypeRate] WebSocket Fehler (${targetWsUrl}):`, err.message);
      hyperateState.error = err.message;
      hyperateState.connected = false;
    });

    ws.on('open', () => {
      console.log(`[HypeRate] WebSocket verbunden (${targetWsUrl})! Initialisiere Session ${cleanSessionId}...`);
      hyperateState.connected = true;
      hyperateState.deviceLabel = relayLabel;
      hyperateState.error = undefined;

      try {
        ws.send(JSON.stringify({
          type: 'subscribe',
          sessionId: cleanSessionId,
          session: cleanSessionId,
        }));
      } catch (_) {}

      try {
        const joinMsg = JSON.stringify({
          topic: `hr:${cleanSessionId}`,
          event: 'phx_join',
          payload: {},
          ref: 0,
        });
        ws.send(joinMsg);
      } catch (_) {}

      hyperatePingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'ping' }));
          } catch (_) {}
          try {
            ws.ping();
          } catch (_) {}
        }
      }, 20000);
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const str = data.toString();
        const json = JSON.parse(str);

        if (typeof json.bpm === 'number' && json.bpm > 0) {
          hyperateState.bpm = Math.round(json.bpm);
          hyperateState.lastUpdated = Date.now();
          hyperateState.connected = true;
          hyperateState.error = undefined;
          return;
        }

        if (typeof json.hr === 'number' && json.hr > 0) {
          hyperateState.bpm = Math.round(json.hr);
          hyperateState.lastUpdated = Date.now();
          hyperateState.connected = true;
          hyperateState.error = undefined;
          return;
        }

        if (typeof json.heartrate === 'number' && json.heartrate > 0) {
          hyperateState.bpm = Math.round(json.heartrate);
          hyperateState.lastUpdated = Date.now();
          hyperateState.connected = true;
          hyperateState.error = undefined;
          return;
        }

        if (json.event === 'hr_update' && json.payload && typeof json.payload.hr === 'number') {
          hyperateState.bpm = Math.round(json.payload.hr);
          hyperateState.lastUpdated = Date.now();
          hyperateState.connected = true;
          hyperateState.error = undefined;
        } else if (json.event === 'phx_reply' && json.payload?.status === 'ok') {
          hyperateState.connected = true;
          hyperateState.deviceLabel = `HypeRate (${cleanSessionId})`;
          console.log(`[HypeRate] Kanal hr:${cleanSessionId} aktiv beigetreten!`);
        }
      } catch (err: any) {
        console.warn('[HypeRate] Parsing error:', err.message);
      }
    });

    ws.on('close', () => {
      hyperateState.connected = false;
      if (hyperateWs === ws) {
        hyperateWs = null;
        console.log('[HypeRate] WebSocket Verbindung getrennt. Reconnect in 5s...');
        setTimeout(() => {
          if (currentConfig.hyperateSessionId === cleanSessionId && !hyperateWs) {
            connectHyperate(cleanSessionId, currentConfig.hyperateRelayUrl);
          }
        }, 5000);
      }
    });
  } catch (err: any) {
    hyperateState.connected = false;
    hyperateState.error = err.message;
    console.error('[HypeRate] Verbindungsaufbau fehlgeschlagen:', err.message);
  }
}

// Pulsoid WebSocket Manager
let pulsoidWs: WebSocket | null = null;
let pulsoidPingTimer: NodeJS.Timeout | null = null;
let pulsoidConnectDebounce: NodeJS.Timeout | null = null;
let pulsoidReconnectTimeout: NodeJS.Timeout | null = null;

function scheduleConnectPulsoid(tokenInput: string) {
  if (pulsoidConnectDebounce) {
    clearTimeout(pulsoidConnectDebounce);
  }
  pulsoidConnectDebounce = setTimeout(() => {
    connectPulsoid(tokenInput);
  }, 350);
}

function extractPulsoidToken(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();
  if (trimmed.includes('access_token=')) {
    const match = trimmed.match(/access_token=([a-zA-Z0-9_\-\.]+)/);
    if (match && match[1]) return match[1];
  }
  if (trimmed.includes('pulsoid.net/widget/view/')) {
    const match = trimmed.match(/widget\/view\/([a-zA-Z0-9_\-\.]+)/);
    if (match && match[1]) return match[1];
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
    try {
      const parsed = new URL(trimmed);
      const token = parsed.searchParams.get('access_token') || parsed.searchParams.get('token');
      if (token) return token;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    } catch (_) {}
  }
  return trimmed;
}

function connectPulsoid(tokenInput: string) {
  const cleanToken = extractPulsoidToken(tokenInput);

  if (pulsoidWs) {
    const oldWs = pulsoidWs;
    pulsoidWs = null;
    try {
      oldWs.on('error', () => {});
      oldWs.removeAllListeners('close');
      oldWs.removeAllListeners('message');
      if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
        oldWs.close();
      }
    } catch (_) {}
  }

  if (pulsoidPingTimer) {
    clearInterval(pulsoidPingTimer);
    pulsoidPingTimer = null;
  }

  if (pulsoidReconnectTimeout) {
    clearTimeout(pulsoidReconnectTimeout);
    pulsoidReconnectTimeout = null;
  }

  if (!cleanToken) {
    pulsoidState.connected = false;
    pulsoidState.deviceLabel = 'Kein Pulsoid Token';
    return;
  }

  const targetWsUrl = `wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(cleanToken)}`;
  console.log(`[Pulsoid] Verbinde mit Pulsoid Real-Time WebSocket...`);

  try {
    const ws = new WebSocket(targetWsUrl, {
      handshakeTimeout: 8000,
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });
    pulsoidWs = ws;

    ws.on('error', (err) => {
      console.warn('[Pulsoid] WebSocket Fehler:', err.message);
      pulsoidState.error = err.message;
      pulsoidState.connected = false;
    });

    ws.on('open', () => {
      console.log('[Pulsoid] WebSocket erfolgreich verbunden!');
      pulsoidState.connected = true;
      pulsoidState.deviceLabel = 'Pulsoid Feed';
      pulsoidState.error = undefined;

      pulsoidPingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
          } catch (_) {}
        }
      }, 25000);
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const str = data.toString();
        const json = JSON.parse(str);

        if (json.error || json.error_code) {
          const msg = json.error_description || json.error || 'Pulsoid API Error';
          pulsoidState.error = String(msg);
          return;
        }

        const hr = json?.data?.heart_rate ?? json?.data?.heartRate ?? json?.data?.bpm ?? json?.heart_rate ?? json?.bpm;
        if (typeof hr === 'number' && hr > 0) {
          pulsoidState.bpm = Math.round(hr);
          pulsoidState.lastUpdated = Date.now();
          pulsoidState.connected = true;
          pulsoidState.deviceLabel = 'Pulsoid Feed';
          pulsoidState.error = undefined;
        }
      } catch (err: any) {
        console.warn('[Pulsoid] Parsing error:', err.message);
      }
    });

    ws.on('close', (code) => {
      if (pulsoidWs === ws) {
        pulsoidWs = null;
        pulsoidState.connected = false;
        console.log(`[Pulsoid] Verbindung getrennt (Code: ${code}).`);
        if (currentConfig.pulsoidToken) {
          pulsoidReconnectTimeout = setTimeout(() => {
            if (!pulsoidWs && currentConfig.pulsoidToken) {
              connectPulsoid(currentConfig.pulsoidToken);
            }
          }, 5000);
        }
      }
    });
  } catch (err: any) {
    console.error('[Pulsoid] Verbindungsaufbau fehlgeschlagen:', err.message);
    pulsoidState.connected = false;
    pulsoidState.error = err.message;
  }
}

// Media updates handler
function handleMediaUpdate(status: string, artist: string, title: string, album: string, source: string) {
  const isPlaying = status.toLowerCase() === 'playing';
  if (isPlaying && (title || artist)) {
    const hasChanged = mediaState.title !== title || mediaState.artist !== artist || !mediaState.isPlaying;
    mediaState.title = title;
    mediaState.artist = artist;
    mediaState.album = album;
    mediaState.isPlaying = true;
    mediaState.sourceName = source;
    mediaState.lastUpdated = Date.now();
    if (hasChanged) {
      console.log(`[Media] Song erkannt (${source}): ${artist ? `${artist} - ` : ''}${title}`);
    }
  } else {
    if (mediaState.isPlaying) {
      mediaState.isPlaying = false;
      mediaState.sourceName = status ? `${source} (${status})` : 'idle';
      mediaState.lastUpdated = Date.now();
      console.log(`[Media] Wiedergabe pausiert/gestoppt: ${status}`);
    }
  }
}

// Automatic Media Detection on Linux (playerctl) & Windows (PowerShell / Spotify title)
let mediaPollTimer: NodeJS.Timeout | null = null;
let playerctlFollowProcess: any = null;

function checkNowPlaying() {
  if (currentConfig.autoMediaDetection === false) return;

  if (process.platform === 'linux') {
    exec(
      "playerctl -p spotify metadata --format '{{status}}///{{artist}}///{{title}}///{{album}}' 2>/dev/null || playerctl metadata --format '{{status}}///{{artist}}///{{title}}///{{album}}' 2>/dev/null",
      (err, stdout) => {
        if (err || !stdout) {
          if (mediaState.isPlaying) {
            mediaState.isPlaying = false;
            mediaState.sourceName = 'playerctl (idle)';
            mediaState.lastUpdated = Date.now();
          }
          return;
        }
        const trimmed = stdout.trim();
        const parts = trimmed.split('///');
        const status = (parts[0] || '').trim();
        const artist = (parts[1] || '').trim();
        const title = (parts[2] || '').trim();
        const album = (parts[3] || '').trim();
        handleMediaUpdate(status, artist, title, album, 'Spotify/playerctl');
      }
    );
  } else if (process.platform === 'win32') {
    // Windows: Check Spotify window title (e.g. "Artist - Track" or "Spotify Free" when paused)
    const psCmd = `powershell -NoProfile -Command "(Get-Process -Name Spotify -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' } | Select-Object -ExpandProperty MainWindowTitle -First 1)"`;
    exec(psCmd, { timeout: 1500 }, (err, stdout) => {
      if (err || !stdout || !stdout.trim()) {
        return;
      }
      const titleText = stdout.trim();
      if (titleText === 'Spotify' || titleText.startsWith('Spotify Free') || titleText.startsWith('Spotify Premium')) {
        if (mediaState.isPlaying) {
          mediaState.isPlaying = false;
          mediaState.sourceName = 'Spotify (Pausiert)';
          mediaState.lastUpdated = Date.now();
        }
        return;
      }
      if (titleText.includes(' - ')) {
        const splitIdx = titleText.indexOf(' - ');
        const artist = titleText.substring(0, splitIdx).trim();
        const song = titleText.substring(splitIdx + 3).trim();
        handleMediaUpdate('Playing', artist, song, '', 'Spotify Windows');
      } else {
        handleMediaUpdate('Playing', '', titleText, '', 'Windows Media');
      }
    });
  }
}

function startPlayerctlFollow() {
  if (process.platform !== 'linux' || currentConfig.autoMediaDetection === false) {
    return;
  }
  if (playerctlFollowProcess) {
    try {
      playerctlFollowProcess.kill();
    } catch {}
    playerctlFollowProcess = null;
  }
  try {
    const child = spawn('playerctl', [
      '-F',
      'metadata',
      '--format',
      '{{status}}///{{artist}}///{{title}}///{{album}}',
    ]);
    playerctlFollowProcess = child;
    child.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        const parts = line.split('///');
        if (parts.length >= 3) {
          const status = (parts[0] || '').trim();
          const artist = (parts[1] || '').trim();
          const title = (parts[2] || '').trim();
          const album = (parts[3] || '').trim();
          handleMediaUpdate(status, artist, title, album, 'playerctl Live');
        }
      }
    });
    child.on('error', () => {});
    child.on('close', () => {
      playerctlFollowProcess = null;
    });
  } catch {}
}

function startAutoMediaPolling() {
  if (mediaPollTimer) {
    clearInterval(mediaPollTimer);
    mediaPollTimer = null;
  }
  mediaPollTimer = setInterval(() => {
    checkNowPlaying();
  }, 1000);

  if (process.platform === 'linux') {
    startPlayerctlFollow();
  }
}

// Background OSC Loop (sends formatted message at configured interval)
let loopTimer: NodeJS.Timeout | null = null;
let lastEvaluatedProfileId: string = '';

function runOscSendCycle() {
  if (!currentConfig.enabled) {
    return;
  }

  // Advance rotating Freitexte index based on interval
  const customTexts = currentConfig.customTexts || [];
  const validTexts = customTexts.filter((t) => t && t.trim().length > 0);
  const textIntervalSec = Math.max(2, currentConfig.customTextIntervalSec || 10);

  if (validTexts.length > 1 && Date.now() - lastCustomTextSwitchTime >= textIntervalSec * 1000) {
    currentCustomTextIndex = (currentCustomTextIndex + 1) % validTexts.length;
    lastCustomTextSwitchTime = Date.now();
  }

  // Determine active format template (manual or rule-evaluated)
  const evaluation = evaluateProfileRules();
  const effectiveTemplate = evaluation.template;

  if (evaluation.profileId !== lastEvaluatedProfileId) {
    console.log(`[Profile Automation] Profil gewechselt: "${lastEvaluatedProfileId || 'initial'}" ➔ "${evaluation.profileId}" (${evaluation.matchedRule?.name || 'Standard'})`);
    lastEvaluatedProfileId = evaluation.profileId;
  }

  const { displayText } = formatChatboxMessage({
    template: effectiveTemplate,
    hrState: getEffectiveHeartRateState(),
    mediaState,
    customStatus: currentConfig.customStatus,
    tick: currentTick,
    marqueeEnabled: currentConfig.marqueeEnabled,
    marqueeWidth: currentConfig.marqueeWidth,
    mediaOnlyWhenPlaying: currentConfig.mediaOnlyWhenPlaying !== false,
    hardwareStats: currentConfig.hardwareStatsEnabled ? hardwareStats : undefined,
    afkState: currentConfig.afkEnabled ? afkState : undefined,
    afkTemplate: currentConfig.afkTemplate,
    afkOverrideChatbox: currentConfig.afkOverrideChatbox !== false,
    customTexts: validTexts,
    currentCustomTextIndex,
  });

  sendOscToVRChat(
    displayText,
    currentConfig.bypassTypingIndicator,
    currentConfig.playSound
  );
}

function restartLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  if (!currentConfig.enabled) {
    return;
  }
  const interval = Math.max(1000, currentConfig.updateIntervalMs || 1500);
  loopTimer = setInterval(() => {
    currentTick++;

    if (currentConfig.hardwareStatsEnabled) {
      updateHardwareStats();
    }

    if (afkState.isAfk && afkState.afkStartTime) {
      afkState.afkDurationSec = Math.floor((Date.now() - afkState.afkStartTime) / 1000);
    } else if (
      currentConfig.afkEnabled &&
      currentConfig.afkTimeoutMinutes &&
      currentConfig.afkTimeoutMinutes > 0
    ) {
      const mode = currentConfig.afkMode || 'vrchat_and_timer';
      if (mode !== 'vrchat_only') {
        const idleMs = Date.now() - afkState.lastActivityTime;
        const thresholdMs = currentConfig.afkTimeoutMinutes * 60 * 1000;
        if (idleMs >= thresholdMs) {
          handleAfkChange(true, 'timer');
        }
      }
    }

    runOscSendCycle();
  }, interval);
}

// Start Server
async function startServer() {
  loadPersistedConfig();

  if (currentConfig.hyperateSessionId) {
    connectHyperate(currentConfig.hyperateSessionId, currentConfig.hyperateRelayUrl);
  }
  if (currentConfig.pulsoidToken) {
    connectPulsoid(currentConfig.pulsoidToken);
  }

  startAutoMediaPolling();
  updateHardwareStats();
  startGpuMonitoring();
  startVRChatOscListener();
  restartLoop();

  const app = express();
  app.use(express.json());

  // API: Get Current Status
  app.get('/api/status', (req, res) => {
    const isCustomRelay = Boolean(currentConfig.hyperateRelayUrl && currentConfig.hyperateRelayUrl.trim());
    const effectiveHr = getEffectiveHeartRateState();
    const evaluation = evaluateProfileRules();

    const response: ServerStatusResponse = {
      oscActive: currentConfig.enabled,
      oscTarget: {
        host: currentConfig.oscHost,
        port: currentConfig.oscPort,
      },
      serverPort: PORT,
      isLinuxMode: process.platform === 'linux',
      isWindowsMode: process.platform === 'win32',
      hasHyperateApiKey: true,
      hyperateKeyMasked: isCustomRelay
        ? (currentConfig.hyperateRelayUrl || '')
        : 'Pelikan Server (164.30.71.45:7871)',
      hyperateConnected: hyperateState.connected,
      pulsoidConnected: pulsoidState.connected,
      heartRateProvider: currentConfig.heartRateProvider || currentConfig.hrProvider || 'hyperate',
      activeHrProvider: currentConfig.heartRateProvider || currentConfig.hrProvider || 'hyperate',
      isUsingDefaultRelay: !isCustomRelay,
      relayDisplayLabel: isCustomRelay ? (currentConfig.hyperateRelayUrl || '') : 'Pelikan Server (164.30.71.45:7871)',
      mediaDetectionActive: currentConfig.autoMediaDetection !== false,
      currentBpm: effectiveHr.bpm,
      hrState: effectiveHr,
      hyperateState,
      pulsoidState,
      bluetoothState,
      currentMedia: mediaState,
      hardwareStats,
      afkState,
      currentCustomTextIndex,
      lastOscText: lastSentText,
      packetsSent: packetsSentCount,
      logs: oscLogs,
      profileAutomationEnabled: currentConfig.profileAutomationEnabled ?? currentConfig.automationEnabled,
      autoActiveProfileId: evaluation.profileId,
      effectiveTemplate: evaluation.template,
      matchedRuleId: evaluation.matchedRule?.id,
      matchedRuleName: evaluation.matchedRule?.name,
      liveHrActive: evaluation.hrActive,
      liveMediaActive: evaluation.mediaActive,
      liveAfkActive: evaluation.afkActive,
      activeAutomationRuleId: evaluation.matchedRule?.id,
      computedActiveProfileId: evaluation.profileId,
    };
    res.json(response);
  });

  // API: Get Configuration
  app.get('/api/config', (req, res) => {
    res.json({
      ...currentConfig,
      hyperateRelayUrl: currentConfig.hyperateRelayUrl || '',
      hasHyperateApiKey: Boolean(HYPERATE_API_KEY && HYPERATE_API_KEY.length > 5),
      hyperateKeyMasked: currentConfig.hyperateRelayUrl ? 'Custom Relay' : 'Pelikan Server (164.30.71.45:7871)',
      heartRateProvider: currentConfig.heartRateProvider || currentConfig.hrProvider || 'hyperate',
      profileAutomationEnabled: currentConfig.profileAutomationEnabled ?? currentConfig.automationEnabled ?? false,
      profileRules: currentConfig.profileRules ?? currentConfig.automationRules ?? DEFAULT_PROFILE_RULES,
    });
  });

  // API: Save Configuration
  app.post('/api/config', (req, res) => {
    const prevSession = currentConfig.hyperateSessionId;
    const prevRelay = currentConfig.hyperateRelayUrl;
    const prevPulsoid = currentConfig.pulsoidToken;
    const body = req.body as Partial<ChatboxConfig>;

    Object.assign(currentConfig, body);
    savePersistedConfig();

    if (body.pulsoidToken !== undefined && body.pulsoidToken !== prevPulsoid) {
      scheduleConnectPulsoid(currentConfig.pulsoidToken);
    }

    if (
      (body.hyperateSessionId !== undefined && body.hyperateSessionId !== prevSession) ||
      (body.hyperateRelayUrl !== undefined && body.hyperateRelayUrl !== prevRelay)
    ) {
      scheduleConnectHyperate(currentConfig.hyperateSessionId, currentConfig.hyperateRelayUrl);
    }

    restartLoop();
    res.json({ success: true, config: currentConfig });
  });

  // API: Save or Update Profile Automation Rules
  app.post('/api/automation/rules', (req, res) => {
    const { rules, enabled } = req.body as { rules?: ProfileAutomationRule[]; enabled?: boolean };
    if (rules !== undefined && Array.isArray(rules)) {
      currentConfig.profileRules = rules;
      currentConfig.automationRules = rules;
    }
    if (enabled !== undefined) {
      currentConfig.profileAutomationEnabled = Boolean(enabled);
      currentConfig.automationEnabled = Boolean(enabled);
    }
    savePersistedConfig();
    restartLoop();
    res.json({
      success: true,
      profileRules: currentConfig.profileRules,
      profileAutomationEnabled: currentConfig.profileAutomationEnabled,
    });
  });

  // API: Reset Automation Rules to Default
  app.post('/api/automation/rules/reset', (req, res) => {
    currentConfig.profileRules = [...DEFAULT_PROFILE_RULES];
    currentConfig.automationRules = [...DEFAULT_PROFILE_RULES];
    currentConfig.profileAutomationEnabled = true;
    currentConfig.automationEnabled = true;
    savePersistedConfig();
    restartLoop();
    res.json({
      success: true,
      profileRules: currentConfig.profileRules,
      profileAutomationEnabled: currentConfig.profileAutomationEnabled,
    });
  });

  // API: Save or Update Profile
  app.post('/api/profiles', (req, res) => {
    const { profile } = req.body as { profile: ChatboxProfile };
    if (!profile || !profile.name || !profile.template) {
      res.status(400).json({ success: false, error: 'Name und Formatvorlage erforderlich' });
      return;
    }
    if (!currentConfig.profiles) currentConfig.profiles = [...DEFAULT_PROFILES];

    const id = profile.id || `profile_${Date.now()}`;
    const newProfile: ChatboxProfile = {
      id,
      name: profile.name.trim(),
      description: (profile.description || '').trim(),
      template: profile.template,
      isBuiltIn: false,
    };

    const existingIndex = currentConfig.profiles.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      currentConfig.profiles[existingIndex] = {
        ...currentConfig.profiles[existingIndex],
        ...newProfile,
        isBuiltIn: currentConfig.profiles[existingIndex].isBuiltIn,
      };
    } else {
      currentConfig.profiles.push(newProfile);
    }

    currentConfig.activeProfileId = id;
    currentConfig.template = newProfile.template;
    savePersistedConfig();
    restartLoop();
    res.json({ success: true, profiles: currentConfig.profiles, activeProfileId: id, config: currentConfig });
  });

  // API: Delete Profile
  app.delete('/api/profiles/:id', (req, res) => {
    const { id } = req.params;
    if (!currentConfig.profiles) currentConfig.profiles = [...DEFAULT_PROFILES];

    currentConfig.profiles = currentConfig.profiles.filter((p) => p.id !== id);

    if (currentConfig.profiles.length === 0) {
      currentConfig.profiles = [{
        id: `custom_${Date.now()}`,
        name: 'Standard Profil',
        description: 'Herzfrequenz & Medien',
        template: '💓 {hr} BPM 💓\\n{song}',
        isBuiltIn: false,
      }];
    }

    if (currentConfig.activeProfileId === id) {
      currentConfig.activeProfileId = currentConfig.profiles[0].id;
      currentConfig.template = currentConfig.profiles[0].template;
    }

    if (currentConfig.profileRules) {
      const fallbackId: string = currentConfig.activeProfileId || currentConfig.profiles[0]?.id || 'profil_3_standard_puls_musik';
      currentConfig.profileRules = currentConfig.profileRules.map((r) =>
        r.targetProfileId === id ? { ...r, targetProfileId: fallbackId } : r
      );
    }

    savePersistedConfig();
    restartLoop();
    res.json({ success: true, profiles: currentConfig.profiles, activeProfileId: currentConfig.activeProfileId, config: currentConfig });
  });

  // API: Reset Profiles to Default
  app.post('/api/profiles/reset', (req, res) => {
    currentConfig.profiles = [...DEFAULT_PROFILES];
    currentConfig.activeProfileId = 'profil_3_standard_puls_musik';
    currentConfig.template = DEFAULT_PROFILES[2].template;
    savePersistedConfig();
    restartLoop();
    res.json({ success: true, profiles: currentConfig.profiles, activeProfileId: currentConfig.activeProfileId, config: currentConfig });
  });

  // API: Manual AFK Toggle
  app.post('/api/afk/toggle', (req, res) => {
    const { forceAfk } = req.body;
    const targetState = typeof forceAfk === 'boolean' ? forceAfk : !afkState.isAfk;
    handleAfkChange(targetState, 'manual');
    res.json({ success: true, afkState });
  });

  // API: Ping Activity (prevents idle AFK)
  app.post('/api/activity', (req, res) => {
    afkState.lastActivityTime = Date.now();
    if (afkState.isAfk && afkState.source === 'timer') {
      handleAfkChange(false, 'manual');
    }
    res.json({ success: true });
  });

  // API: Update Heart Rate from Client (BLE, Pulsoid, or Hyperate)
  app.post('/api/heart-rate', (req, res) => {
    const { bpm, provider, deviceLabel, battery, connected } = req.body;
    const numBpm = typeof bpm === 'number' ? Math.max(0, Math.min(250, bpm)) : 0;
    const isConn = connected !== undefined ? Boolean(connected) : numBpm > 0;

    if (provider === 'bluetooth') {
      bluetoothState.bpm = numBpm;
      bluetoothState.connected = isConn;
      bluetoothState.lastUpdated = Date.now();
      if (deviceLabel) bluetoothState.deviceLabel = deviceLabel;
      if (battery !== undefined) bluetoothState.battery = battery;
    } else if (provider === 'pulsoid') {
      pulsoidState.bpm = numBpm;
      pulsoidState.connected = isConn;
      pulsoidState.lastUpdated = Date.now();
      if (deviceLabel) pulsoidState.deviceLabel = deviceLabel;
    } else if (provider === 'hyperate') {
      hyperateState.bpm = numBpm;
      hyperateState.connected = isConn;
      hyperateState.lastUpdated = Date.now();
      if (deviceLabel) hyperateState.deviceLabel = deviceLabel;
    }

    if (provider) {
      currentConfig.heartRateProvider = provider;
      savePersistedConfig();
    }

    res.json({
      success: true,
      effectiveHr: getEffectiveHeartRateState(),
      hyperateState,
      pulsoidState,
      bluetoothState,
    });
  });

  // API: Update Media (from playerctl, Windows PowerShell, Spotify, or Web UI)
  app.post('/api/media/now-playing', (req, res) => {
    const { title, artist, album, isPlaying, positionSec, durationSec, source } = req.body;
    if (title !== undefined) mediaState.title = String(title);
    if (artist !== undefined) mediaState.artist = String(artist);
    if (album !== undefined) mediaState.album = String(album);
    if (isPlaying !== undefined) mediaState.isPlaying = Boolean(isPlaying);
    if (positionSec !== undefined) mediaState.positionSec = Number(positionSec);
    if (durationSec !== undefined) mediaState.durationSec = Number(durationSec);
    if (source !== undefined) mediaState.sourceName = String(source);
    mediaState.lastUpdated = Date.now();
    res.json({ success: true, mediaState });
  });

  // API: Direct Manual Test Send to VRChat Chatbox
  app.post('/api/send-osc', async (req, res) => {
    const { text, bypassTyping = true, playSound = false } = req.body;
    const message = text || 'Test von VRChat OSC Hub';
    const sent = await sendOscToVRChat(message, bypassTyping, playSound);
    res.json({ success: sent, message });
  });

  // API: Clear Logs
  app.post('/api/logs/clear', (req, res) => {
    oscLogs.length = 0;
    res.json({ success: true });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`  VRChat OSC Hub running!                `);
    console.log(`  Port: http://0.0.0.0:${PORT}           `);
    console.log(`  Target VRChat: ${currentConfig.oscHost}:${currentConfig.oscPort}`);
    console.log(`  Settings file: ${CONFIG_FILE_PATH}`);
    console.log(`=========================================`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[FEHLER] Port ${PORT} ist bereits durch eine andere Instanz belegt!`);
      console.error(`Bitte beende die vorherige Instanz im Terminal mit STRG+C oder führe aus:`);
      console.error(`  fuser -k ${PORT}/tcp || kill $(lsof -t -i:${PORT})\n`);
      process.exit(1);
    } else {
      console.error('[Server Fehler]', err.message);
    }
  });
}

startServer();
