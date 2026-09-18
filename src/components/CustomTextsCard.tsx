import React from 'react';
import { MessageSquare, Plus, Trash2, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface CustomTextsCardProps {
  lang?: AppLanguage;
  customTexts: string[];
  intervalSec: number;
  currentActiveIndex: number;
  onUpdateCustomTexts: (texts: string[]) => Promise<void> | void;
  onUpdateInterval: (intervalSec: number) => Promise<void> | void;
  onInsertMainVariable: (tag: string) => void;
}

export const CustomTextsCard: React.FC<CustomTextsCardProps> = ({
  lang = 'en',
  customTexts,
  intervalSec,
  currentActiveIndex,
  onUpdateCustomTexts,
  onUpdateInterval,
  onInsertMainVariable,
}) => {
  const t = translations[lang];
  const texts = customTexts && customTexts.length > 0
    ? customTexts
    : [lang === 'de' ? 'Willkommen in meiner VRChat Instanz!' : 'Welcome to my VRChat instance!'];

  const handleTextChange = (index: number, val: string) => {
    const updated = [...texts];
    updated[index] = val;
    onUpdateCustomTexts(updated);
  };

  const handleAddText = () => {
    const nextNum = texts.length + 1;
    const newTexts = [...texts, lang === 'de' ? `Mein Text ${nextNum}` : `My Text ${nextNum}`];
    onUpdateCustomTexts(newTexts);
  };

  const handleRemoveText = (index: number) => {
    if (texts.length <= 1) {
      onUpdateCustomTexts(['']);
      return;
    }
    const updated = texts.filter((_, i) => i !== index);
    onUpdateCustomTexts(updated);
  };

  return (
    <div id="card-custom-texts" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.customTexts.title}
              <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {texts.length} {lang === 'de' ? 'Texte' : 'Texts'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{t.customTexts.subtitle}</p>
          </div>
        </div>

        {/* Add button */}
        <button
          id="btn-add-custom-text"
          type="button"
          onClick={handleAddText}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.customTexts.addBtn}</span>
        </button>
      </div>

      {/* Rotation Interval Setting */}
      <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <div>
            <span className="text-xs font-semibold text-slate-200 block">{t.customTexts.intervalLabel}</span>
            <span className="text-[11px] text-slate-400">{t.customTexts.intervalDesc}</span>
          </div>
        </div>
        <select
          id="select-custom-text-interval"
          value={intervalSec || 10}
          onChange={(e) => onUpdateInterval(Number(e.target.value))}
          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value={5}>5s</option>
          <option value={10}>10s ({lang === 'de' ? 'Standard' : 'Default'})</option>
          <option value={15}>15s</option>
          <option value={30}>30s</option>
          <option value={60}>60s</option>
        </select>
      </div>

      {/* Custom texts list */}
      <div className="space-y-2">
        {texts.map((txt, index) => {
          const isActive = index === currentActiveIndex;
          return (
            <div
              key={index}
              className={`p-2.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{index + 1}
                </span>
                {isActive && (
                  <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> {lang === 'de' ? 'Wird aktuell angezeigt' : 'Currently active'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveText(index)}
                  className="ml-auto p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                  title={t.common.delete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                id={`input-custom-text-${index}`}
                type="text"
                value={txt}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder={lang === 'de' ? 'Freitext eingeben...' : 'Enter custom text...'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          );
        })}
      </div>

      {/* Insert Tag Shortcut */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">{lang === 'de' ? 'Variable im Chatbox-Format:' : 'Variable in format template:'}</span>
        <button
          type="button"
          onClick={() => onInsertMainVariable('{freitext}')}
          className="flex items-center gap-1 text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{'{freitext}'}</span>
        </button>
      </div>
    </div>
  );
};
