export type HeartRateProvider = 'hyperate' | 'pulsoid' | 'bluetooth' | 'manual';

export interface ProviderHeartRateState {
  bpm: number;
  connected: boolean;
  lastUpdated: number;
  deviceLabel: string;
  error?: string;
  idOrToken?: string;
  battery?: number;
}

export interface HeartRateState {
  bpm: number;
  provider: HeartRateProvider;
  connected: boolean;
  lastUpdated: number;
  battery?: number;
  deviceLabel?: string;
  error?: string;
}

export interface MediaState {
  title: string;
  artist: string;
  album?: string;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  sourceName: string; // 'mpris' | 'browser' | 'spotify' | 'windows-media' | 'manual'
  lastUpdated: number;
}

export interface HardwareStats {
  enabled: boolean;
  cpuPercent: number;
  ramPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  cpuTemp?: number;
  gpuPercent?: number;
  gpuTemp?: number;
  lastUpdated: number;
}

export interface AfkState {
  isAfk: boolean;
  afkStartTime: number | null;
  afkDurationSec: number;
  source: 'vrchat_osc' | 'timer' | 'manual' | 'vrchat_movement' | 'none';
  lastActivityTime: number;
  lastMovementTime?: number;
}

export interface ChatboxProfile {
  id: string;
  name: string;
  description?: string;
  template: string;
  isBuiltIn?: boolean;
}

export type AppLanguage = 'en' | 'de';

export type RuleConditionValue = 'true' | 'false' | 'any';

export interface ProfileAutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  targetProfileId: string;
  conditions: {
    heartRate: RuleConditionValue; // 'true' | 'false' | 'any'
    media: RuleConditionValue;     // 'true' | 'false' | 'any'
    afk?: RuleConditionValue;      // 'true' | 'false' | 'any'
  };
}

export interface ChatboxConfig {
  language?: AppLanguage;
  enabled: boolean;
  template: string;
  updateIntervalMs: number;
  playSound: boolean;
  bypassTypingIndicator: boolean;
  marqueeEnabled: boolean;
  marqueeWidth: number;
  customStatus: string;
  oscHost: string;
  oscPort: number;
  hyperateSessionId: string;
  hyperateRelayUrl?: string; // Optional custom Pelikan relay server (e.g. ws://my-pelikan-server:8080)
  pulsoidToken: string;
  heartRateProvider?: HeartRateProvider;
  hrProvider?: HeartRateProvider; // Alias for backwards compatibility
  autoMediaDetection?: boolean;
  mediaOnlyWhenPlaying?: boolean;
  // Profiles / Formatvorlagen
  profiles?: ChatboxProfile[];
  activeProfileId?: string;
  // Hardware statistics
  hardwareStatsEnabled?: boolean;
  // AFK detection & custom text
  afkEnabled?: boolean;
  afkMode?: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only';
  afkTimeoutMinutes?: number; // Inactivity trigger in minutes
  afkTemplate?: string;
  afkOverrideChatbox?: boolean;
  // Freitexte (rotating messages)
  customTexts?: string[];
  customTextIntervalSec?: number;
  // Automated Profile Conditions / Rules
  profileAutomationEnabled?: boolean;
  automationEnabled?: boolean; // Alias
  profileRules?: ProfileAutomationRule[];
  automationRules?: ProfileAutomationRule[]; // Alias
}

export interface OscLogEntry {
  id: string;
  timestamp: string;
  address: string;
  text: string;
  bytes: number;
  success: boolean;
  error?: string;
}

export interface ServerStatusResponse {
  oscActive: boolean;
  oscTarget: {
    host: string;
    port: number;
  };
  serverPort: number;
  isLinuxMode: boolean;
  isWindowsMode?: boolean;
  hasHyperateApiKey: boolean;
  hyperateKeyMasked: string;
  hyperateConnected: boolean;
  pulsoidConnected?: boolean;
  heartRateProvider?: HeartRateProvider;
  activeHrProvider?: HeartRateProvider; // Alias
  isUsingDefaultRelay?: boolean;
  relayDisplayLabel?: string;
  mediaDetectionActive?: boolean;
  currentBpm: number;
  hrState?: HeartRateState;
  hyperateState?: ProviderHeartRateState;
  pulsoidState?: ProviderHeartRateState;
  bluetoothState?: ProviderHeartRateState;
  currentMedia: MediaState;
  hardwareStats?: HardwareStats;
  afkState?: AfkState;
  currentCustomTextIndex?: number;
  lastOscText: string;
  packetsSent: number;
  logs: OscLogEntry[];
  // Profile Automation Live Status
  profileAutomationEnabled?: boolean;
  autoActiveProfileId?: string;
  effectiveTemplate?: string;
  matchedRuleId?: string;
  matchedRuleName?: string;
  liveHrActive?: boolean;
  liveMediaActive?: boolean;
  liveAfkActive?: boolean;
  // Backwards compatibility fields
  activeAutomationRuleId?: string | null;
  computedActiveProfileId?: string;
}
