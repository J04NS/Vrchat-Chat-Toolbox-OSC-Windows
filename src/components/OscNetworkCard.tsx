import React, { useState } from 'react';
import { Network, Send, CheckCircle2, XCircle, Trash2, Shield, Activity, RefreshCw, Download, Upload } from 'lucide-react';
import { ChatboxConfig, OscLogEntry, AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface OscNetworkCardProps {
  lang?: AppLanguage;
  oscHost: string;
  oscPort: number;
  packetsSent: number;
  logs: OscLogEntry[];
  config?: ChatboxConfig;
  onUpdateTarget: (host: string, port: number) => void;
  onSendTest: () => Promise<void>;
  onClearLogs: () => Promise<void>;
  onOpenMigrateModal?: () => void;
}

export const OscNetworkCard: React.FC<OscNetworkCardProps> = ({
  lang = 'en',
  oscHost,
  oscPort,
  packetsSent,
  logs,
  config,
  onUpdateTarget,
  onSendTest,
  onClearLogs,
  onOpenMigrateModal,
}) => {
  const t = translations[lang];
  const [hostInput, setHostInput] = useState(oscHost);
  const [portInput, setPortInput] = useState(String(oscPort));
  const [isSending, setIsSending] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTarget(hostInput.trim(), Number(portInput) || 9000);
  };

  const handleTestClick = async () => {
    setIsSending(true);
    await onSendTest();
    setTimeout(() => setIsSending(false), 400);
  };

  const handleDownloadConfig = () => {
    // Security & privacy: HypeRate Session-ID is emptied when exporting
    const exportConfig = {
      ...(config || {}),
      hyperateSessionId: '', // Always empty on download!
    };
    const jsonStr = JSON.stringify(exportConfig, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chatbox-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="card-osc-network" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
            <Network className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.oscNetwork.title}
            </h2>
            <p className="text-xs text-slate-400">{t.oscNetwork.subtitle}</p>
          </div>
        </div>

        {/* Packet counter badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-4 h-4 text-teal-400" />
          <div className="text-right leading-none">
            <span className="text-sm font-bold font-mono text-white">{packetsSent}</span>
            <span className="text-[10px] text-slate-400 ml-1">{t.oscNetwork.packetsSent}</span>
          </div>
        </div>
      </div>

      {/* Target configuration */}
      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">{t.oscNetwork.targetAddress}</label>
          <input
            id="input-osc-host"
            type="text"
            value={hostInput}
            onChange={(e) => setHostInput(e.target.value)}
            placeholder="127.0.0.1 (Default)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">{t.oscNetwork.port} (Default 9000)</label>
          <div className="flex gap-2">
            <input
              id="input-osc-port"
              type="number"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              placeholder="9000"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
            />
            <button
              id="btn-save-osc-target"
              type="submit"
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              {t.common.save}
            </button>
          </div>
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-300">{t.oscNetwork.logsTitle}</span>
        <div className="flex items-center gap-2">
          <button
            id="btn-send-test-osc"
            type="button"
            onClick={handleTestClick}
            disabled={isSending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            {isSending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            {t.oscNetwork.sendTestBtn}
          </button>
          <button
            id="btn-clear-logs"
            type="button"
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title={t.oscNetwork.clearLogsBtn}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 p-2 font-mono text-[11px] space-y-1.5">
        {logs.length === 0 ? (
          <div className="py-6 text-center text-slate-500 italic">
            {t.oscNetwork.noLogsYet}
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {log.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                <span className="text-teal-400 shrink-0">{log.address}</span>
                <span className="text-slate-200 truncate">{log.text}</span>
              </div>
              <div className="text-[10px] text-slate-500 shrink-0 pl-2">
                {log.bytes} B
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export & Import / Migration Area */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{lang === 'de' ? 'HypeRate Session-ID bleibt beim Exportieren unberührt & leer' : 'HypeRate Session ID is always kept empty and protected upon export'}</span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onOpenMigrateModal && (
            <button
              id="btn-open-migrate-modal"
              type="button"
              onClick={onOpenMigrateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-950/40 hover:bg-teal-900/50 text-teal-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-teal-500/40 hover:border-teal-400"
              title={lang === 'de' ? 'Frühere oder ältere config.json hochladen und in Schema v3 konvertieren' : 'Upload and migrate earlier config.json to modern v3'}
            >
              <Upload className="w-3.5 h-3.5 text-teal-400" />
              {lang === 'de' ? 'Alte Config hochladen & konvertieren' : 'Upload & Migrate Config'}
            </button>
          )}
          <button
            id="btn-download-config-json"
            type="button"
            onClick={handleDownloadConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            {lang === 'de' ? 'Exportieren' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
