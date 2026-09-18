import React, { useState } from 'react';
import { Music, Play, Pause, Radio, Disc, Sparkles, Terminal, FileCode, Check, Download } from 'lucide-react';
import { AppLanguage, MediaState } from '../types';
import { translations } from '../lib/i18n';

interface MediaSourceCardProps {
  lang?: AppLanguage;
  mediaState: MediaState;
  autoMediaDetection?: boolean;
  mediaOnlyWhenPlaying?: boolean;
  onUpdateMedia: (data: Partial<MediaState>) => Promise<void> | void;
  onUpdateConfig: (data: { autoMediaDetection?: boolean; mediaOnlyWhenPlaying?: boolean }, notifyMsg?: string) => Promise<void> | void;
  serverPort: number;
}

export const MediaSourceCard: React.FC<MediaSourceCardProps> = ({
  lang = 'en',
  mediaState,
  autoMediaDetection = true,
  mediaOnlyWhenPlaying = true,
  onUpdateMedia,
  onUpdateConfig,
}) => {
  const t = translations[lang];
  const [manualTitle, setManualTitle] = useState(mediaState.title);
  const [manualArtist, setManualArtist] = useState(mediaState.artist);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleTogglePlay = () => {
    onUpdateMedia({ isPlaying: !mediaState.isPlaying });
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMedia({
      title: manualTitle.trim(),
      artist: manualArtist.trim(),
      isPlaying: true,
      sourceName: lang === 'de' ? 'Manuell' : 'Manual',
    });
  };

  const powershellWatcherCode = `# Windows Media / Spotify Background Watcher
# Sends currently playing music to local VRChat OSC Hub
$apiUrl = "http://localhost:3000/api/media/now-playing"
$lastSong = ""

Write-Host "VRChat OSC Hub Windows Media Watcher started..." -ForegroundColor Cyan

while ($true) {
    try {
        # 1. Spotify Desktop window title check
        $spotify = Get-Process -Name "spotify" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object -First 1
        if ($spotify) {
            $titleText = $spotify.MainWindowTitle
            if ($titleText -and $titleText -notmatch "^(Spotify.*|Giga.*)$") {
                if ($titleText -ne $lastSong) {
                    $lastSong = $titleText
                    $parts = $titleText -split " - ", 2
                    $artist = if ($parts.Length -gt 1) { $parts[0] } else { "" }
                    $songTitle = if ($parts.Length -gt 1) { $parts[1] } else { $parts[0] }
                    
                    $body = @{
                        title = $songTitle
                        artist = $artist
                        isPlaying = $true
                        source = "Spotify Windows"
                    } | ConvertTo-Json
                    
                    Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    Write-Host "[Spotify] Now Playing: $artist - $songTitle" -ForegroundColor Green
                }
            }
        }
    } catch {}
    Start-Sleep -Milliseconds 1000
}`;

  const copyScript = () => {
    navigator.clipboard.writeText(powershellWatcherCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div id="card-media-source" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Music className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.media.title}
            </h2>
            <p className="text-xs text-slate-400">{t.media.subtitle}</p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              mediaState.isPlaying
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Disc className={`w-3.5 h-3.5 ${mediaState.isPlaying ? 'animate-spin text-indigo-400' : ''}`} />
            {mediaState.isPlaying ? t.media.playing : t.media.paused}
          </span>
        </div>
      </div>

      {/* Now Playing Widget */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
              {mediaState.sourceName || (lang === 'de' ? 'Medienquelle' : 'Media Source')}
            </span>
            <p className="text-sm font-bold text-white truncate">
              {mediaState.title || (lang === 'de' ? 'Keine Musik aktiv' : 'No music playing')}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {mediaState.artist || (lang === 'de' ? 'Warte auf Spotify oder Medien-Player...' : 'Waiting for Spotify or media player...')}
            </p>
          </div>
          <button
            id="btn-toggle-media-play"
            type="button"
            onClick={handleTogglePlay}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            title={mediaState.isPlaying ? t.media.paused : t.media.playing}
          >
            {mediaState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Configuration Toggles */}
      <div className="space-y-2.5 mb-4">
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">{t.media.autoDetect}</span>
            <span className="text-[11px] text-slate-400">{t.media.autoDetectDesc}</span>
          </div>
          <input
            id="toggle-auto-media"
            type="checkbox"
            checked={autoMediaDetection}
            onChange={(e) => onUpdateConfig({ autoMediaDetection: e.target.checked })}
            className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">{t.media.onlyWhenPlaying}</span>
            <span className="text-[11px] text-slate-400">{t.media.onlyWhenPlayingDesc}</span>
          </div>
          <input
            id="toggle-only-when-playing"
            type="checkbox"
            checked={mediaOnlyWhenPlaying}
            onChange={(e) => onUpdateConfig({ mediaOnlyWhenPlaying: e.target.checked })}
            className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleSaveManual} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-4">
        <span className="text-xs font-semibold text-slate-300 block mb-2">{t.media.manualInputTitle}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input
            id="input-manual-song-title"
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder={t.media.songTitlePlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            id="input-manual-song-artist"
            type="text"
            value={manualArtist}
            onChange={(e) => setManualArtist(e.target.value)}
            placeholder={t.media.artistPlaceholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-end">
          <button
            id="btn-save-manual-media"
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {t.media.setSongBtn}
          </button>
        </div>
      </form>

      {/* Windows & Linux Media Watcher Helper */}
      <div className="pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            {lang === 'de' ? 'Windows PowerShell Synchronisation' : 'Windows PowerShell Sync'}
          </span>
          <button
            id="btn-copy-ps-script"
            type="button"
            onClick={copyScript}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3" />}
            {copiedScript ? (lang === 'de' ? 'Kopiert!' : 'Copied!') : (lang === 'de' ? 'Skript kopieren' : 'Copy Script')}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          {lang === 'de'
            ? 'Die Datei "windows-media-watcher.ps1" liegt im Projektordner und sendet laufende Musik von Spotify Windows im Hintergrund an deinen VRChat Chatbox Hub.'
            : 'The file "windows-media-watcher.ps1" is located in the root folder and streams Spotify tracks in the background to your VRChat Chatbox Hub.'}
        </p>
      </div>
    </div>
  );
};
