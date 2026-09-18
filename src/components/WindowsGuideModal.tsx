import React, { useState } from 'react';
import { Terminal, Copy, Check, X, Server, ShieldCheck, Gamepad2, Radio, Download, ExternalLink, Monitor, PlaySquare, Music } from 'lucide-react';
import { useLanguage } from '../i18n';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverPort: number;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({
  isOpen,
  onClose,
  serverPort,
}) => {
  const { t, language } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startBatContent = `@echo off
setlocal enabledelayedexpansion
title VRChat OSC Chatbox Hub (Windows)

:: Change to the directory of this batch file
cd /d "%~dp0"

echo ======================================================
echo   VRChat OSC Chatbox Hub (Windows 10 / 11)
echo   Target: VRChat OSC at 127.0.0.1:9000 (UDP)
echo ======================================================
echo.

:: 1. Verify Node.js
where node >nul 2>nul
if errorlevel 1 goto :NO_NODE

:: 2. Verify npm
where npm >nul 2>nul
if errorlevel 1 goto :NO_NPM

echo [1/3] Node.js detected:
node -v
echo.

:: 3. Install dependencies if node_modules is missing
if not exist node_modules goto :INSTALL_DEPS
if not exist node_modules\\express goto :INSTALL_DEPS
goto :CHECK_BUILD

:INSTALL_DEPS
echo [2/3] Installing dependencies (npm install --legacy-peer-deps)...
echo       This may take 1-2 minutes on first run...
echo.
call npm install --legacy-peer-deps
if errorlevel 1 goto :NPM_INSTALL_ERROR
echo.

:CHECK_BUILD
:: 4. Check build
if not exist dist\\server.cjs goto :DO_BUILD
goto :LAUNCH_APP

:DO_BUILD
echo [3/3] Building production bundle (npm run build)...
echo.
call npm run build
if errorlevel 1 goto :BUILD_ERROR
echo.

:LAUNCH_APP
echo ======================================================
echo [OK] Launching server at http://localhost:3000...
echo      VRChat OSC Ingress listening on UDP 9001 (AFK & parameters)
echo      Chatbox output sending to UDP 9000
echo.
echo      Press CTRL + C in this window to stop the server.
echo ======================================================
echo.

start http://localhost:3000
node dist\\server.cjs
if errorlevel 1 goto :SERVER_ERROR

echo Server stopped.
pause
exit /b 0

:NO_NODE
echo [ERROR] Node.js was not found on this PC!
echo Please install Node.js from https://nodejs.org/ (LTS recommended).
pause
exit /b 1

:NO_NPM
echo [ERROR] npm was not found in your system PATH!
pause
exit /b 1

:NPM_INSTALL_ERROR
echo [ERROR] npm install failed!
pause
exit /b 1

:BUILD_ERROR
echo [ERROR] npm run build failed!
pause
exit /b 1

:SERVER_ERROR
echo [WARNING] Server exited with an error code!
pause
exit /b 1`;

  const autostartCmd = language === 'de'
    ? `# 1. Drücke Win + R und gib ein:
shell:startup
# 2. Erstelle im geöffneten Autostart-Ordner eine Verknüpfung zu start-windows.bat!`
    : `# 1. Press Win + R and enter:
shell:startup
# 2. In the opened Startup folder, create a shortcut to start-windows.bat!`;

  const firewallCmd = `# Windows Firewall rule for VRChat OSC (Run PowerShell as Administrator)
New-NetFirewallRule -DisplayName "VRChat OSC Ingress" -Direction Inbound -LocalPort 9001 -Protocol UDP -Action Allow
New-NetFirewallRule -DisplayName "VRChat OSC Hub Web" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow`;

  const manualTestCmd = `cmd /k start-windows.bat`;

  const handleDownloadBat = () => {
    // Force Windows CRLF line endings so cmd.exe never stumbles on LF
    const crlfContent = startBatContent.replace(/\r?\n/g, '\r\n');
    const blob = new Blob([crlfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'start-windows.bat';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">
        {/* Close Button */}
        <button
          id="btn-close-windows-guide"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {language === 'de' ? 'Windows Setup & Autostart Anleitung' : 'Windows Setup & Autostart Guide'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'de'
                ? 'VRChat Chatbox unter Windows (10 & 11) einrichten und betreiben'
                : 'Setting up and running VRChat Chatbox on Windows 10 & 11'}
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          {/* Section 1: Quickstart Bat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <PlaySquare className="w-4 h-4" />
                {language === 'de' ? '1. Start per Doppelklick (start-windows.bat)' : '1. Launch with double-click (start-windows.bat)'}
              </h3>
              <button
                type="button"
                onClick={handleDownloadBat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <Download className="w-3 h-3" />
                {language === 'de' ? 'start-windows.bat herunterladen' : 'Download start-windows.bat'}
              </button>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'de'
                ? 'Kopiere das Projekt auf deinen Windows-PC. Die Datei start-windows.bat prüft automatisch Node.js, baut die App und öffnet deinen Browser auf http://localhost:3000:'
                : 'Copy the project to your Windows PC. The start-windows.bat file checks Node.js, builds the app, and launches your browser at http://localhost:3000:'}
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap">{startBatContent}</pre>
              <button
                onClick={() => copyCode('start-bat', startBatContent)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'start-bat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section 2: VRChat OSC activation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" />
              {language === 'de' ? '2. OSC in VRChat auf Windows aktivieren' : '2. Enable OSC in VRChat on Windows'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'de'
                ? 'Damit VRChat die Chatbox-Nachrichten empfängt, muss OSC im Spiel aktiviert sein:'
                : 'For VRChat to receive chatbox messages, OSC must be enabled in-game:'}
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {language === 'de' ? (
                <>
                  <li>Drücke in VRChat auf der Tastatur <strong>R</strong> oder öffne das Quick Menu (Action Wheel in VR).</li>
                  <li>Gehe auf <strong>Options</strong> &rarr; <strong>OSC</strong>.</li>
                  <li>Stelle sicher, dass <strong>OSC Enabled</strong> auf <strong>ON</strong> steht.</li>
                  <li>VRChat lauscht standardmäßig auf <code>127.0.0.1:9000</code> UDP für Nachrichten und sendet Avatar-Daten an Port <code>9001</code>.</li>
                </>
              ) : (
                <>
                  <li>Press <strong>R</strong> on your keyboard in VRChat or open the Quick Menu (Action Wheel in VR).</li>
                  <li>Go to <strong>Options</strong> &rarr; <strong>OSC</strong>.</li>
                  <li>Ensure that <strong>OSC Enabled</strong> is set to <strong>ON</strong>.</li>
                  <li>By default, VRChat listens on <code>127.0.0.1:9000</code> UDP for chatbox messages and broadcasts avatar data to port <code>9001</code>.</li>
                </>
              )}
            </ol>
          </div>

          {/* Section 3: Spotify on Windows */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Music className="w-4 h-4" />
              {language === 'de' ? '3. Spotify Desktop Erkennung unter Windows' : '3. Spotify Desktop Detection on Windows'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'de'
                ? 'Der Hub erkennt automatisch die offizielle Spotify Desktop App unter Windows:'
                : 'The hub automatically detects the official Spotify Desktop app on Windows:'}
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {language === 'de' ? (
                <>
                  <li>Sobald Spotify Musik abspielt, ändert sich der Windows-Fenstertitel zu <code>Interpret – Titel</code>.</li>
                  <li>Der integrierte Windows-Dienst liest dies ab und überträgt Titel und Künstler direkt in die Chatbox.</li>
                  <li>Alternativ kannst du das Skript <code>windows-media-watcher.ps1</code> ausführen für sekundenschnelle Updates.</li>
                </>
              ) : (
                <>
                  <li>When Spotify plays music, the Windows window title changes to <code>Artist – Track Name</code>.</li>
                  <li>The integrated Windows service reads this and streams track and artist directly into your chatbox.</li>
                  <li>Alternatively, run <code>windows-media-watcher.ps1</code> for sub-second updates.</li>
                </>
              )}
            </ul>
          </div>

          {/* Section 4: Autostart with Windows */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" />
              {language === 'de' ? '4. Windows Autostart (Automatischer Start beim PC-Hochfahren)' : '4. Windows Autostart (Launch on boot)'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'de'
                ? 'So startet der VRChat OSC Hub automatisch, wenn du deinen Windows-PC einschaltest:'
                : 'Launch VRChat OSC Hub automatically every time Windows boots:'}
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre className="whitespace-pre-wrap">{autostartCmd}</pre>
              <button
                onClick={() => copyCode('autostart', autostartCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'autostart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section 5: Windows Defender & Firewall */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              {language === 'de' ? '5. Windows Defender & Firewall' : '5. Windows Defender & Firewall'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'de'
                ? 'Wenn Windows beim ersten Start fragt, erlaube Node.js den Zugriff in Privaten Netzwerken. Falls Avatar-Parameter (AFK/Bewegung) auf Port 9001 blockiert werden, führe diesen Befehl in PowerShell (als Administrator) aus:'
                : 'When prompted on first run, allow Node.js access on Private Networks. If avatar parameters (AFK/motion) are blocked on port 9001, run this PowerShell command as Administrator:'}
            </p>
            <div className="relative p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              <pre className="whitespace-pre-wrap">{firewallCmd}</pre>
              <button
                onClick={() => copyCode('firewall', firewallCmd)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'firewall' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section 6: Troubleshooting / Bat closes immediately */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-amber-400" />
              {language === 'de' ? 'Hilfe: Die .bat schließt sich sofort?' : 'Troubleshooting: .bat closes immediately?'}
            </h3>
            <p className="text-xs text-slate-300">
              <strong>{language === 'de' ? '1. Reines Windows CMD:' : '1. Native Windows CMD:'}</strong>{' '}
              {language === 'de'
                ? 'Die Datei ist 100% Windows Batch-Code und nutzt ausschließlich Windows-Dienste (PowerShell für Spotify, UDP für VRChat).'
                : 'The file is 100% Windows Batch (CMD) and uses Windows native services (PowerShell for Spotify, UDP for VRChat).'}
            </p>
            <p className="text-xs text-slate-300">
              <strong>{language === 'de' ? '2. Häufige Ursachen:' : '2. Common causes:'}</strong>{' '}
              {language === 'de'
                ? 'Stelle sicher, dass Node.js (LTS von nodejs.org) installiert ist und lade die Datei über den oberen blauen Button herunter (native Windows CRLF Zeilenumbrüche mit Fehler-Pause).'
                : 'Ensure Node.js (LTS from nodejs.org) is installed, and download the batch file using the blue download button above (contains Windows CRLF line endings and automatic pause on error).'}
            </p>
            <p className="text-xs text-slate-300">
              <strong>{language === 'de' ? '3. Manuelle Fehlersuche:' : '3. Manual diagnosis:'}</strong>{' '}
              {language === 'de'
                ? 'Öffne die Eingabeaufforderung (CMD) in dem Ordner und führe den Befehl aus, um die Fehlermeldung zu sehen:'
                : 'Open Command Prompt (CMD) in the project directory and run:'}
            </p>
            <div className="relative p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400">
              <pre>{manualTestCmd}</pre>
              <button
                onClick={() => copyCode('manual-cmd', manualTestCmd)}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedId === 'manual-cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            {language === 'de' ? 'Verstanden & Schließen' : 'Understood & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
