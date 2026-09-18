import { ChatboxConfig, ChatboxProfile, ProfileAutomationRule, RuleConditionValue, AppLanguage } from '../types';

export interface MigrationResult {
  migratedConfig: ChatboxConfig;
  detectedVersion: string;
  changesSummary: string[];
  profilesMigrated: number;
  rulesMigrated: number;
  legacyVariablesFixed: number;
}

const DEFAULT_PROFILES_DE: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profil 1: Nur Musik (Kein Puls)',
    description: 'Zeigt Musiktitel & Uhrzeit an – keinerlei Pulsanzeige',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profil 2: Minimal (Kein Puls & Keine Medien)',
    description: 'Weder Puls noch Musik – reiner Status/Freitext & Uhrzeit',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profil 3: Standard (Puls & Musik)',
    description: 'Klassisches 2-Zeilen-Format mit Herzfrequenz & Spotify',
    template: '💓 {hr} BPM 💓\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profil 4: Nur Puls',
    description: 'Reine Herzfrequenzanzeige mit animiertem Herzschlag-Icon',
    template: '💓 {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_hardware_afk',
    name: 'Profil 5: Hardware & AFK',
    description: 'CPU- & RAM-Auslastung und automatische AFK-Dauer',
    template: '💻 {hw} | 💤 {afk_time}',
    isBuiltIn: true,
  },
  {
    id: 'profil_6_full_hud',
    name: 'Profil 6: Volles HUD (Alles)',
    description: 'Puls, Musik, Hardware-Monitor & rotierende Freitexte',
    template: '💓 {hr} BPM 🎵 {song}\\n💻 {cpu} / {ram} 💬 {freitext}',
    isBuiltIn: true,
  },
];

const DEFAULT_PROFILES_EN: ChatboxProfile[] = [
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

export function migrateTemplateString(template: string): { migrated: string; replacedCount: number } {
  if (!template || typeof template !== 'string') {
    return { migrated: '💓 {hr} BPM 💓\\n{song}', replacedCount: 0 };
  }

  let text = template;
  let count = 0;

  const replacements: Array<{ regex: RegExp; replacement: string }> = [
    { regex: /\{heart_?rate\}|\{bpm\}/gi, replacement: '{hr}' },
    { regex: /\{song_name\}|\{track\}|\{music\}|\{now_?playing\}|\{media\}/gi, replacement: '{song}' },
    { regex: /\{afk_duration\}|\{afk_timer\}|\{afk_time_formatted\}/gi, replacement: '{afk_time}' },
    { regex: /\{afk_minutes\}|\{afk_mins\}/gi, replacement: '{afk_min}' },
    { regex: /\{datetime\}|\{system_?time\}|\{local_?time\}/gi, replacement: '{clock}' },
    { regex: /\{hardware_stats\}|\{hardware\}/gi, replacement: '{hw}' },
    { regex: /\{memory\}|\{mem\}/gi, replacement: '{ram}' },
    { regex: /\{cpu_usage\}|\{cpu_percent\}/gi, replacement: '{cpu}' },
    { regex: /\{gpu_usage\}|\{gpu_percent\}/gi, replacement: '{gpu}' },
  ];

  for (const { regex, replacement } of replacements) {
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      count += matches.length;
      text = text.replace(regex, replacement);
    }
  }

  return { migrated: text, replacedCount: count };
}

function parseConditionValue(val: any): RuleConditionValue {
  if (val === 'true' || val === true || val === 1 || val === 'active') return 'true';
  if (val === 'false' || val === false || val === 0 || val === 'inactive') return 'false';
  return 'any';
}

export function migrateConfigJson(rawJson: any, targetLang: AppLanguage = 'en'): MigrationResult {
  const summary: string[] = [];
  let totalReplacedVars = 0;
  let detectedVersion = 'v1.0 / Legacy Format';

  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error(targetLang === 'de' ? 'Ungültige JSON-Datei oder leeres Objekt.' : 'Invalid JSON file or empty object.');
  }

  // Version Detection
  if (rawJson.schemaVersion === 3 || (rawJson.profiles && rawJson.profileRules)) {
    detectedVersion = 'v3.0 (Schema mit Profil-Automation)';
  } else if (rawJson.profiles || rawJson.activeProfileId) {
    detectedVersion = 'v2.0 (Multi-Profil Format)';
  } else if (rawJson.hyperateApiKey || rawJson.bpmTemplate || rawJson.oscIp) {
    detectedVersion = 'v1.0 / v1.5 (Frühere Version)';
  }

  const lang: AppLanguage = rawJson.language === 'de' || rawJson.language === 'en' ? rawJson.language : targetLang;

  // 1. Template Migration
  const rawMainTemplate =
    rawJson.template ??
    rawJson.chatboxTemplate ??
    rawJson.bpmTemplate ??
    rawJson.format ??
    '💓 {hr} BPM 💓\\n{song}';

  const { migrated: cleanMainTemplate, replacedCount: mainReplaced } = migrateTemplateString(String(rawMainTemplate));
  totalReplacedVars += mainReplaced;
  if (mainReplaced > 0) {
    summary.push(
      lang === 'de'
        ? `${mainReplaced} veraltete Variablen im Haupt-Template modernisiert (z.B. {bpm} ➔ {hr}, {track} ➔ {song})`
        : `Modernized ${mainReplaced} legacy tags in main template ({bpm} ➔ {hr}, {track} ➔ {song})`
    );
  }

  // 2. Interval normalization
  let rawInterval = 1500;
  if (typeof rawJson.updateIntervalMs === 'number') {
    rawInterval = rawJson.updateIntervalMs;
  } else if (typeof rawJson.intervalMs === 'number') {
    rawInterval = rawJson.intervalMs;
  } else if (typeof rawJson.updateInterval === 'number') {
    rawInterval = rawJson.updateInterval < 100 ? rawJson.updateInterval * 1000 : rawJson.updateInterval;
  } else if (typeof rawJson.intervalSec === 'number') {
    rawInterval = rawJson.intervalSec * 1000;
  }
  rawInterval = Math.max(500, Math.min(10000, rawInterval));

  // 3. AFK Settings
  const rawAfkTemplate = rawJson.afkTemplate ?? '💤 AFK [{afk_time}] - Back soon!';
  const { migrated: cleanAfkTemplate, replacedCount: afkReplaced } = migrateTemplateString(String(rawAfkTemplate));
  totalReplacedVars += afkReplaced;

  const rawAfkMode = rawJson.afkMode;
  const afkMode: 'vrchat_and_timer' | 'vrchat_only' | 'timer_only' =
    rawAfkMode === 'vrchat_only' || rawAfkMode === 'timer_only' ? rawAfkMode : 'vrchat_and_timer';
  const afkTimeoutMinutes = Math.max(1, Number(rawJson.afkTimeoutMinutes || rawJson.afkTimeout || 5));

  // 4. Profiles Migration
  const builtInList = lang === 'de' ? DEFAULT_PROFILES_DE : DEFAULT_PROFILES_EN;
  let migratedProfiles: ChatboxProfile[] = [];
  if (Array.isArray(rawJson.profiles) && rawJson.profiles.length > 0) {
    migratedProfiles = rawJson.profiles.map((p: any, idx: number) => {
      const { migrated: pCleanTemplate, replacedCount } = migrateTemplateString(String(p.template || ''));
      totalReplacedVars += replacedCount;
      return {
        id: String(p.id || `profile_migrated_${idx}`),
        name: String(p.name || `Profil ${idx + 1}`),
        description: p.description ? String(p.description) : undefined,
        template: pCleanTemplate,
        isBuiltIn: Boolean(p.isBuiltIn),
      };
    });
    summary.push(
      lang === 'de'
        ? `${migratedProfiles.length} Profile migriert und Variablen normalisiert`
        : `Migrated ${migratedProfiles.length} profiles and normalized placeholder tags`
    );
  } else {
    migratedProfiles = builtInList;
    summary.push(lang === 'de' ? 'Standard-Profile initialisiert' : 'Initialized standard profile suite');
  }

  // Ensure unique profile IDs
  const existingIds = new Set(migratedProfiles.map((p) => p.id));
  builtInList.forEach((b: ChatboxProfile) => {
    if (!existingIds.has(b.id)) {
      migratedProfiles.push(b);
      existingIds.add(b.id);
    }
  });

  // 5. Active Profile ID
  let activeProfileId = rawJson.activeProfileId ? String(rawJson.activeProfileId) : 'profil_3_standard_puls_musik';
  if (!existingIds.has(activeProfileId)) {
    activeProfileId = migratedProfiles[0]?.id || 'profil_3_standard_puls_musik';
  }

  // 6. Custom Texts
  let customTexts: string[] = [];
  const rawCustomTexts = rawJson.customTexts ?? rawJson.freitexte ?? rawJson.texts;
  if (Array.isArray(rawCustomTexts)) {
    customTexts = rawCustomTexts.map((s) => String(s)).filter((s) => s.trim().length > 0);
  } else if (typeof rawCustomTexts === 'string' && rawCustomTexts.trim().length > 0) {
    customTexts = rawCustomTexts.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  if (customTexts.length === 0) {
    customTexts = lang === 'de'
      ? ['Willkommen in meiner VRChat Instanz! ✨', 'VRChat OSC Hub läuft stabil unter Windows / Linux']
      : ['Welcome to my VRChat instance! ✨', 'VRChat OSC Hub running smoothly on Windows & Linux'];
  }

  // 7. Profile Automation Rules
  let migratedRules: ProfileAutomationRule[] = [];
  const rawRules = rawJson.profileRules ?? rawJson.automationRules ?? rawJson.rules;
  if (Array.isArray(rawRules) && rawRules.length > 0) {
    migratedRules = rawRules.map((r: any, idx: number) => {
      const cond = r.conditions || {};
      const targetId = existingIds.has(r.targetProfileId) ? r.targetProfileId : (migratedProfiles[0]?.id || 'profil_3_standard_puls_musik');
      return {
        id: String(r.id || `rule_migrated_${idx}_${Date.now()}`),
        name: String(r.name || r.title || `Regel ${idx + 1}`),
        enabled: r.enabled !== false,
        conditions: {
          heartRate: parseConditionValue(cond.heartRate ?? cond.hrActive ?? r.hrActive),
          media: parseConditionValue(cond.media ?? cond.mediaActive ?? r.mediaActive),
          afk: parseConditionValue(cond.afk ?? cond.afkActive ?? r.afkActive),
        },
        targetProfileId: targetId,
      };
    });
    summary.push(lang === 'de' ? `${migratedRules.length} Automationsregeln konvertiert & Zielprofile validiert` : `Migrated ${migratedRules.length} automation rules with verified target profiles`);
  } else {
    migratedRules = [
      {
        id: 'rule_music_no_hr',
        name: lang === 'de' ? 'Wenn Puls = Aus & Musik = An ➔ Profil 1 (Nur Musik)' : 'When Pulse = Off & Music = On ➔ Profile 1 (Music Only)',
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
        name: lang === 'de' ? 'Wenn Puls = An & Musik = An ➔ Profil 3 (Standard Puls & Musik)' : 'When Pulse = On & Music = On ➔ Profile 3 (Standard HR & Music)',
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
        name: lang === 'de' ? 'Wenn Puls = An & Musik = Aus ➔ Profil 4 (Nur Puls)' : 'When Pulse = On & Music = Off ➔ Profile 4 (Heart Rate Only)',
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
        name: lang === 'de' ? 'Wenn Puls = Aus & Musik = Aus ➔ Profil 2 (Minimal / Freitext)' : 'When Pulse = Off & Music = Off ➔ Profile 2 (Minimal / Custom Text)',
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
        name: lang === 'de' ? 'Wenn AFK = An ➔ Profil 5 (Hardware & AFK)' : 'When AFK = On ➔ Profile 5 (Hardware & AFK)',
        enabled: false,
        targetProfileId: 'profil_5_hardware_afk',
        conditions: {
          heartRate: 'any',
          media: 'any',
          afk: 'true',
        },
      },
    ];
    summary.push(lang === 'de' ? 'Standard-Regelwerk für automatischen Profilwechsel integriert' : 'Configured smart automation rules for seamless profile switching');
  }

  const hyperateSessionId = rawJson.hyperateSessionId ? String(rawJson.hyperateSessionId) : '';
  const pulsoidToken = rawJson.pulsoidToken ? String(rawJson.pulsoidToken) : '';

  const migratedConfig: ChatboxConfig = {
    language: lang,
    enabled: rawJson.enabled !== false,
    template: cleanMainTemplate,
    updateIntervalMs: rawInterval,
    playSound: Boolean(rawJson.playSound || rawJson.sound || rawJson.audio),
    bypassTypingIndicator: rawJson.bypassTypingIndicator !== false && rawJson.bypassTyping !== false,
    marqueeEnabled: Boolean(rawJson.marqueeEnabled || rawJson.marquee),
    marqueeWidth: Number(rawJson.marqueeWidth || 35),
    customStatus: rawJson.customStatus ? String(rawJson.customStatus) : '',
    oscHost: String(rawJson.oscHost || rawJson.ip || rawJson.host || '127.0.0.1'),
    oscPort: Number(rawJson.oscPort || rawJson.port || 9000),
    heartRateProvider: rawJson.heartRateProvider || rawJson.hrProvider || rawJson.provider || 'hyperate',
    hyperateSessionId,
    hyperateRelayUrl: rawJson.hyperateRelayUrl ? String(rawJson.hyperateRelayUrl) : '',
    pulsoidToken,
    autoMediaDetection: rawJson.autoMediaDetection !== false && rawJson.mediaDetection !== false,
    mediaOnlyWhenPlaying: rawJson.mediaOnlyWhenPlaying !== false,
    customTexts,
    customTextIntervalSec: Math.max(2, Number(rawJson.customTextIntervalSec || rawJson.textInterval || 10)),
    hardwareStatsEnabled: Boolean(rawJson.hardwareStatsEnabled || rawJson.hardwareStats),
    afkEnabled: Boolean(rawJson.afkEnabled || rawJson.afk),
    afkMode,
    afkTimeoutMinutes,
    afkTemplate: cleanAfkTemplate,
    afkOverrideChatbox: rawJson.afkOverrideChatbox !== false,
    profiles: migratedProfiles,
    activeProfileId,
    profileAutomationEnabled: rawJson.profileAutomationEnabled ?? rawJson.automationEnabled ?? false,
    profileRules: migratedRules,
  };

  summary.push(lang === 'de' ? 'Vollständige Chatbox-Konfiguration auf Schema v3+ aktualisiert' : 'Configuration successfully upgraded to modern schema v3+');

  return {
    migratedConfig,
    detectedVersion,
    changesSummary: summary,
    profilesMigrated: migratedProfiles.length,
    rulesMigrated: migratedRules.length,
    legacyVariablesFixed: totalReplacedVars,
  };
}
