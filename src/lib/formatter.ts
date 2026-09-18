import { AfkState, HardwareStats, HeartRateState, MediaState, AppLanguage } from '../types';

export function getHeartIcon(bpm: number, tick: number = 0): string {
  if (bpm <= 0) return '🩶';
  const pulse = tick % 2 === 0 ? '❤️' : '🤍';
  if (bpm >= 150) return tick % 2 === 0 ? '🔥' : '❤️';
  if (bpm >= 120) return tick % 2 === 0 ? '💓' : '💗';
  if (bpm >= 90) return pulse;
  if (bpm >= 60) return tick % 2 === 0 ? '💖' : '💓';
  return '💙';
}

export function getBpmZoneName(bpm: number, lang: AppLanguage = 'en'): string {
  if (lang === 'de') {
    if (bpm <= 0) return 'Inaktiv';
    if (bpm < 60) return 'Ruhe';
    if (bpm < 100) return 'Normal';
    if (bpm < 140) return 'Erhöht';
    if (bpm < 170) return 'Cardio';
    return 'Peak';
  }
  if (bpm <= 0) return 'Inactive';
  if (bpm < 60) return 'Resting';
  if (bpm < 100) return 'Normal';
  if (bpm < 140) return 'Elevated';
  if (bpm < 170) return 'Cardio';
  return 'Peak';
}

export function formatAfkDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface FormatterOptions {
  template: string;
  hrState: HeartRateState;
  mediaState: MediaState;
  customStatus?: string;
  tick?: number;
  marqueeEnabled?: boolean;
  marqueeWidth?: number;
  mediaOnlyWhenPlaying?: boolean;
  hardwareStats?: HardwareStats;
  afkState?: AfkState;
  afkTemplate?: string;
  afkOverrideChatbox?: boolean;
  customTexts?: string[];
  currentCustomTextIndex?: number;
}

export function formatChatboxMessage(
  templateOrOptions: string | FormatterOptions,
  hrStateParam?: HeartRateState,
  mediaStateParam?: MediaState,
  customStatusParam?: string,
  tickParam: number = 0,
  marqueeEnabledParam: boolean = false,
  marqueeWidthParam: number = 40,
  mediaOnlyWhenPlayingParam: boolean = true,
  hardwareStatsParam?: HardwareStats,
  afkStateParam?: AfkState,
  customTextsParam?: string[],
  currentCustomTextIndexParam: number = 0
): { fullText: string; displayText: string; isOverflow: boolean } {
  let options: FormatterOptions;
  if (typeof templateOrOptions === 'object') {
    options = templateOrOptions;
  } else {
    options = {
      template: templateOrOptions,
      hrState: hrStateParam || { bpm: 0, provider: 'manual', connected: false, lastUpdated: 0 },
      mediaState: mediaStateParam || { title: '', artist: '', isPlaying: false, positionSec: 0, durationSec: 0, sourceName: '', lastUpdated: 0 },
      customStatus: customStatusParam || '',
      tick: tickParam,
      marqueeEnabled: marqueeEnabledParam,
      marqueeWidth: marqueeWidthParam,
      mediaOnlyWhenPlaying: mediaOnlyWhenPlayingParam,
      hardwareStats: hardwareStatsParam,
      afkState: afkStateParam,
      customTexts: customTextsParam,
      currentCustomTextIndex: currentCustomTextIndexParam,
    };
  }

  const {
    template,
    hrState,
    mediaState,
    customStatus = '',
    tick = 0,
    marqueeEnabled = false,
    marqueeWidth = 40,
    mediaOnlyWhenPlaying = true,
    hardwareStats,
    afkState,
    afkTemplate = '💤 AFK [{afk_time}] - Back soon!',
    afkOverrideChatbox = true,
    customTexts = [],
    currentCustomTextIndex = 0,
  } = options;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const clock = `${hours}:${minutes}`;
  const clockWithSec = `${hours}:${minutes}:${seconds}`;

  const hrBpmStr = hrState.bpm > 0 ? String(hrState.bpm) : '--';
  const hrIcon = getHeartIcon(hrState.bpm, tick);
  const hrZone = getBpmZoneName(hrState.bpm);

  const rawTitle = mediaState.title.trim();
  const songArtist = mediaState.artist.trim();
  const isPlaying = Boolean(mediaState.isPlaying && rawTitle && rawTitle !== 'Keine Musik');

  let songTitle = rawTitle;
  let fullSong = '';
  if (isPlaying) {
    fullSong = songArtist ? `${songTitle} - ${songArtist}` : songTitle;
  } else if (!mediaOnlyWhenPlaying && rawTitle) {
    fullSong = songArtist ? `${songTitle} - ${songArtist}` : songTitle;
  } else {
    songTitle = '';
    fullSong = '';
  }

  const musicIcon = isPlaying ? '🎵' : '';
  const batteryStr = hrState.battery !== undefined ? `${hrState.battery}%` : '';

  // Hardware stats placeholders
  const cpuStr = hardwareStats ? `${Math.round(hardwareStats.cpuPercent)}%` : '--%';
  const ramStr = hardwareStats ? `${Math.round(hardwareStats.ramPercent)}%` : '--%';
  const ramGbStr = hardwareStats ? `${hardwareStats.ramUsedGb.toFixed(1)}/${hardwareStats.ramTotalGb.toFixed(1)}GB` : '';
  const gpuStr = hardwareStats && hardwareStats.gpuPercent !== undefined ? `${Math.round(hardwareStats.gpuPercent)}%` : '';
  const cpuTempStr = hardwareStats && hardwareStats.cpuTemp ? `${Math.round(hardwareStats.cpuTemp)}°C` : '';
  const gpuTempStr = hardwareStats && hardwareStats.gpuTemp ? `${Math.round(hardwareStats.gpuTemp)}°C` : '';
  const hwSummary = hardwareStats
    ? (gpuStr ? `CPU: ${cpuStr} | RAM: ${ramStr} | GPU: ${gpuStr}` : `CPU: ${cpuStr} | RAM: ${ramStr}`)
    : '';

  // AFK duration and formatting
  const afkDuration = afkState?.afkDurationSec ?? 0;
  const afkTimeStr = formatAfkDuration(afkDuration);
  const afkStatusStr = afkState?.isAfk ? `💤 AFK (${afkTimeStr})` : '';

  // Rotating Freitexte
  let activeRotatingText = '';
  if (customTexts && customTexts.length > 0) {
    const validTexts = customTexts.filter((t) => t && t.trim().length > 0);
    if (validTexts.length > 0) {
      const idx = Math.abs(currentCustomTextIndex) % validTexts.length;
      activeRotatingText = validTexts[idx];
    }
  }
  if (!activeRotatingText) {
    activeRotatingText = customStatus || '';
  }

  // Determine base template (AFK Override mode if currently AFK)
  let message = template;
  if (afkState?.isAfk && afkOverrideChatbox) {
    message = afkTemplate;
  } else if (template === '💓 {hr} BPM 💓\\n{song}' || template === '💓 {hr} BPM 💓\n{song}') {
    // If user uses default template with song, adapt gracefully if song is empty/stopped
    message = isPlaying && fullSong ? `💓 ${hrBpmStr} BPM 🎵 ${fullSong} 💓` : `💓 ${hrBpmStr} BPM 💓`;
  }

  // Replace placeholders
  message = message
    .replace(/\\n/g, '\n')
    .replace(/\{hr\}/g, hrBpmStr)
    .replace(/\{hr_icon\}/g, hrIcon)
    .replace(/\{hr_zone\}/g, hrZone)
    .replace(/\{song\}/g, fullSong)
    .replace(/\{song_title\}/g, songTitle)
    .replace(/\{song_artist\}/g, songArtist)
    .replace(/\{music_icon\}/g, musicIcon)
    .replace(/\{clock\}/g, clock)
    .replace(/\{clock_sec\}/g, clockWithSec)
    .replace(/\{battery\}/g, batteryStr)
    // Hardware Stats
    .replace(/\{cpu\}/g, cpuStr)
    .replace(/\{ram\}/g, ramStr)
    .replace(/\{ram_gb\}/g, ramGbStr)
    .replace(/\{gpu\}/g, gpuStr)
    .replace(/\{cpu_temp\}/g, cpuTempStr)
    .replace(/\{gpu_temp\}/g, gpuTempStr)
    .replace(/\{hw\}/g, hwSummary)
    // AFK placeholders
    .replace(/\{afk_time\}/g, afkTimeStr)
    .replace(/\{afk_status\}/g, afkStatusStr)
    // Rotating Freitexte & Custom Status
    .replace(/\{freitext\}/g, activeRotatingText)
    .replace(/\{text_cycle\}/g, activeRotatingText)
    .replace(/\{custom_text\}/g, activeRotatingText || customStatus || '');

  // Replace indexed freitexte {freitext_1}, {freitext_2}, etc.
  if (customTexts && customTexts.length > 0) {
    customTexts.forEach((txt, idx) => {
      const reg = new RegExp(`\\{freitext_${idx + 1}\\}`, 'g');
      message = message.replace(reg, txt || '');
    });
  }

  // Clean empty parentheses or leftovers if media isn't playing
  if (!isPlaying) {
    message = message
      .replace(/\|\s*\|\s*/g, '|')
      .replace(/\[\s*\]/g, '')
      .replace(/\(\s*\)/g, '');
  }

  // Clean multiple spaces and trim
  message = message.replace(/[ \t]+/g, ' ').trim();

  // VRChat hard limit is 144 characters
  const isOverflow = message.length > 144;
  let displayText = message;
  if (marqueeEnabled && message.length > marqueeWidth) {
    const loopStr = message + '       ';
    const startIdx = tick % loopStr.length;
    const doubleStr = loopStr + loopStr;
    displayText = doubleStr.substring(startIdx, startIdx + marqueeWidth);
  } else if (message.length > 144) {
    displayText = message.substring(0, 141) + '...';
  }

  return {
    fullText: message,
    displayText,
    isOverflow,
  };
}
