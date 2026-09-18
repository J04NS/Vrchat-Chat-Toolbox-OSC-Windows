import React, { useState, useRef } from 'react';
import { Upload, FileUp, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, X, Shield, Download, RefreshCw, FileText } from 'lucide-react';
import { AppLanguage, ChatboxConfig } from '../types';
import { migrateConfigJson, MigrationResult } from '../lib/configMigrator';

interface ConfigMigrateModalProps {
  isOpen: boolean;
  lang?: AppLanguage;
  onClose: () => void;
  onApplyMigratedConfig: (migrated: ChatboxConfig) => Promise<void>;
}

export const ConfigMigrateModal: React.FC<ConfigMigrateModalProps> = ({
  isOpen,
  lang = 'en',
  onClose,
  onApplyMigratedConfig,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    setMigrationResult(null);

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setErrorMsg(lang === 'de' ? 'Bitte wähle eine gültige .json Datei aus.' : 'Please select a valid .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = migrateConfigJson(parsed, lang);
        setMigrationResult(result);
      } catch (err: any) {
        setErrorMsg(
          lang === 'de'
            ? `Fehler beim Lesen der JSON-Datei: ${err.message || 'Ungültiges Format'}`
            : `Failed to parse JSON file: ${err.message || 'Invalid format'}`
        );
      }
    };
    reader.onerror = () => {
      setErrorMsg(lang === 'de' ? 'Dateilesefehler aufgetreten.' : 'File reading error occurred.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApply = async () => {
    if (!migrationResult) return;
    setIsApplying(true);
    try {
      await onApplyMigratedConfig(migrationResult.migratedConfig);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownloadMigrated = () => {
    if (!migrationResult) return;
    const jsonStr = JSON.stringify(
      {
        ...migrationResult.migratedConfig,
        hyperateSessionId: '', // Security wipe
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatbox-config-v3-migrated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'de' ? 'Alte Konfiguration hochladen & konvertieren' : 'Upload & Migrate Older Config JSON'}
                <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Auto-Migrator
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'de'
                  ? 'Konvertiert JSON-Dateien von früheren Versionen automatisch in das neue Schema v3'
                  : 'Automatically converts JSON configs from older versions into modern Schema v3'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-teal-400 bg-teal-950/20 shadow-lg shadow-teal-950/50'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              {lang === 'de'
                ? 'Klicke zum Auswählen oder ziehe die config.json hierhin'
                : 'Click to select or drop your config.json file here'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'de'
                ? 'Unterstützt alle Formate (v1.0, v2.0, Profile, alte Platzhalter wie {bpm} / {track})'
                : 'Supports all legacy formats (v1.0, v2.0, multi-profile, old tags like {bpm} / {track})'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">
                  {lang === 'de' ? 'Fehler beim Konvertieren:' : 'Conversion Error:'}
                </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Migration Analysis & Preview */}
          {migrationResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Detected info badge banner */}
              <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>{lang === 'de' ? 'Erfolgreich analysiert & konvertiert' : 'Successfully parsed & migrated'}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {lang === 'de' ? 'Erkanntes Quellformat:' : 'Detected format:'}{' '}
                    <strong className="text-teal-200 font-mono">{migrationResult.detectedVersion}</strong>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {migrationResult.profilesMigrated} {lang === 'de' ? 'Profile' : 'Profiles'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    {migrationResult.rulesMigrated} {lang === 'de' ? 'Regeln' : 'Rules'}
                  </span>
                </div>
              </div>

              {/* Summary Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  {lang === 'de' ? 'Durchgeführte Migrationen:' : 'Migration Details:'}
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {migrationResult.changesSummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Template Preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-1">
                  {lang === 'de' ? 'Haupt-Template nach Konvertierung:' : 'Main Template after conversion:'}
                </span>
                <code className="block p-2 rounded bg-slate-900 text-teal-300 font-mono text-xs break-all">
                  {migrationResult.migratedConfig.template}
                </code>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {lang === 'de'
                ? 'Deine HypeRate Session-ID und privaten Tokens werden sicher übernommen und niemals im Klartext nach außen übertragen.'
                : 'Sensitive tokens are safely preserved and never leaked.'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {lang === 'de' ? 'Abbrechen' : 'Cancel'}
          </button>
          <div className="flex items-center gap-2.5">
            {migrationResult && (
              <button
                type="button"
                onClick={handleDownloadMigrated}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-400" />
                {lang === 'de' ? 'Als v3 JSON exportieren' : 'Download v3 JSON'}
              </button>
            )}
            <button
              type="button"
              disabled={!migrationResult || isApplying}
              onClick={handleApply}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                migrationResult && !isApplying
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-950/50 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isApplying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {lang === 'de' ? 'Wird angewendet...' : 'Applying...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'de' ? 'Konvertieren & Jetzt anwenden' : 'Convert & Apply Now'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
