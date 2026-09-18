import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Type,
  Play,
  Square,
  Bookmark,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  Pencil,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { AppLanguage, ChatboxConfig, ChatboxProfile } from '../types';
import { translations } from '../lib/i18n';

interface ChatboxSettingsCardProps {
  lang?: AppLanguage;
  config: ChatboxConfig;
  activeProfileId?: string;
  effectiveTemplate?: string;
  isAutomationActive?: boolean;
  matchedRuleName?: string;
  onUpdateConfig: (updates: Partial<ChatboxConfig>, notifyMessage?: string) => Promise<void> | void;
}

const DEFAULT_BUILTIN_PROFILES: ChatboxProfile[] = [
  {
    id: 'profil_1_nur_musik',
    name: 'Profile 1: Music Only',
    description: 'No heart rate, only song & clock',
    template: '🎵 {song} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_2_minimal_kein_puls_keine_medien',
    name: 'Profile 2: Minimal',
    description: 'No HR & no media, custom text only',
    template: '💬 {freitext} | 🕒 {clock}',
    isBuiltIn: true,
  },
  {
    id: 'profil_3_standard_puls_musik',
    name: 'Profile 3: Standard (HR & Music)',
    description: 'Heart rate and music on 2 lines',
    template: '💓 {hr} BPM 💓\\n{song}',
    isBuiltIn: true,
  },
  {
    id: 'profil_4_nur_puls',
    name: 'Profile 4: Heart Rate Only',
    description: 'Only heart rate with pulsing heart',
    template: '💓 {hr} BPM {hr_icon}',
    isBuiltIn: true,
  },
  {
    id: 'profil_5_hardware_afk',
    name: 'Profile 5: Hardware & AFK',
    description: 'CPU, RAM and AFK timer',
    template: '💻 {hw} | 💤 {afk_time}',
    isBuiltIn: true,
  },
  {
    id: 'profil_6_full_hud',
    name: 'Profile 6: Full HUD',
    description: 'Heart rate, music, hardware & text',
    template: '💓 {hr} BPM 🎵 {song}\\n💻 {cpu} / {ram} 💬 {freitext}',
    isBuiltIn: true,
  },
];

export const ChatboxSettingsCard: React.FC<ChatboxSettingsCardProps> = ({
  lang = 'en',
  config,
  activeProfileId,
  effectiveTemplate,
  isAutomationActive,
  matchedRuleName,
  onUpdateConfig,
}) => {
  const t = translations[lang];

  // Active template state
  const [templateInput, setTemplateInput] = useState(config.template || '💓 {hr} BPM 💓\\n{song}');

  // Add Profile State
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [newProfileTemplate, setNewProfileTemplate] = useState('');

  // Edit Profile State
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTemplate, setEditTemplate] = useState('');

  // Feedback state
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);

  const profiles: ChatboxProfile[] =
    config.profiles && config.profiles.length > 0 ? config.profiles : DEFAULT_BUILTIN_PROFILES;

  const currentSelectedProfileId =
    activeProfileId || config.activeProfileId || profiles[2]?.id || profiles[0]?.id;

  const activeProfile = profiles.find((p) => p.id === currentSelectedProfileId) || profiles[0];

  // Keep templateInput in sync with config.template when config changes externally
  useEffect(() => {
    if (config.template !== undefined && config.template !== templateInput) {
      setTemplateInput(config.template);
    }
  }, [config.template]);

  const hasUnsavedChanges = activeProfile && templateInput !== activeProfile.template;

  const templateVariables = [
    { tag: '{hr}', label: lang === 'de' ? 'Puls' : 'HR' },
    { tag: '{hr_icon}', label: lang === 'de' ? 'Herz Icon' : 'Heart Icon' },
    { tag: '{song}', label: lang === 'de' ? 'Titel & Interpret' : 'Song' },
    { tag: '{clock}', label: lang === 'de' ? 'Uhrzeit' : 'Clock' },
    { tag: '{freitext}', label: lang === 'de' ? 'Rotierender Text' : 'Custom Text' },
    { tag: '{cpu}', label: 'CPU %' },
    { tag: '{ram}', label: 'RAM %' },
    { tag: '{hw}', label: lang === 'de' ? 'Hardware' : 'Hardware' },
    { tag: '{afk_time}', label: 'AFK Timer' },
    { tag: '\\n', label: lang === 'de' ? 'Neue Zeile' : 'Newline' },
  ];

  // Select profile
  const handleSelectProfile = (profile: ChatboxProfile) => {
    setTemplateInput(profile.template);
    onUpdateConfig(
      {
        activeProfileId: profile.id,
        template: profile.template,
      },
      lang === 'de' ? `Profil "${profile.name}" aktiviert` : `Profile "${profile.name}" activated`
    );
  };

  // Quick save current template to the active profile
  const handleSaveToActiveProfile = () => {
    if (!activeProfile) return;

    const updatedProfiles = profiles.map((p) => {
      if (p.id === activeProfile.id) {
        return {
          ...p,
          template: templateInput,
        };
      }
      return p;
    });

    onUpdateConfig(
      {
        profiles: updatedProfiles,
        template: templateInput,
      },
      lang === 'de'
        ? `Vorlage in "${activeProfile.name}" gespeichert!`
        : `Template saved in "${activeProfile.name}"!`
    );

    setSavedSuccessKey('active-profile');
    setTimeout(() => setSavedSuccessKey(null), 2500);
  };

  // Open Edit Profile form
  const handleStartEditProfile = (profile: ChatboxProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProfileId(profile.id);
    setEditName(profile.name);
    setEditDesc(profile.description || '');
    setEditTemplate(profile.template);
    setShowAddProfile(false);
  };

  // Save changes to profile
  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileId || !editName.trim()) return;

    const updatedProfiles = profiles.map((p) => {
      if (p.id === editingProfileId) {
        return {
          ...p,
          name: editName.trim(),
          description: editDesc.trim(),
          template: editTemplate,
        };
      }
      return p;
    });

    const isCurrentActive = editingProfileId === currentSelectedProfileId;

    const updates: Partial<ChatboxConfig> = {
      profiles: updatedProfiles,
    };

    if (isCurrentActive) {
      updates.template = editTemplate;
      setTemplateInput(editTemplate);
    }

    onUpdateConfig(
      updates,
      lang === 'de'
        ? `Profil "${editName.trim()}" erfolgreich gespeichert!`
        : `Profile "${editName.trim()}" saved successfully!`
    );

    setEditingProfileId(null);
    setSavedSuccessKey(`edit-${editingProfileId}`);
    setTimeout(() => setSavedSuccessKey(null), 2500);
  };

  // Open Create Profile form
  const handleOpenAddProfile = () => {
    setNewProfileName('');
    setNewProfileDesc('');
    setNewProfileTemplate(templateInput || '💓 {hr} BPM | 🎵 {song}');
    setShowAddProfile(true);
    setEditingProfileId(null);
  };

  // Create new profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newProf: ChatboxProfile = {
      id: newId,
      name: newProfileName.trim(),
      description: newProfileDesc.trim() || (lang === 'de' ? 'Eigenes Profil' : 'Custom Profile'),
      template: newProfileTemplate || templateInput,
      isBuiltIn: false,
    };

    const updatedProfiles = [...profiles, newProf];
    onUpdateConfig(
      {
        profiles: updatedProfiles,
        activeProfileId: newId,
        template: newProf.template,
      },
      lang === 'de' ? `Profil "${newProf.name}" erstellt` : `Profile "${newProf.name}" created`
    );

    setTemplateInput(newProf.template);
    setNewProfileName('');
    setNewProfileDesc('');
    setNewProfileTemplate('');
    setShowAddProfile(false);
  };

  // Delete profile
  const handleDeleteProfile = (profileId: string, profileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    const fallback = updatedProfiles[0];
    onUpdateConfig(
      {
        profiles: updatedProfiles,
        activeProfileId: fallback?.id || '',
        template: fallback?.template || templateInput,
      },
      lang === 'de' ? `Profil "${profileName}" gelöscht` : `Profile "${profileName}" deleted`
    );
  };

  // Reset profiles to defaults
  const handleResetProfiles = () => {
    const confirmMsg =
      lang === 'de'
        ? 'Möchtest du wirklich alle Profile auf die Standard-Vorlagen zurücksetzen?'
        : 'Do you really want to reset all profiles to default templates?';
    if (window.confirm(confirmMsg)) {
      onUpdateConfig(
        {
          profiles: DEFAULT_BUILTIN_PROFILES,
          activeProfileId: DEFAULT_BUILTIN_PROFILES[2].id,
          template: DEFAULT_BUILTIN_PROFILES[2].template,
        },
        t.chatbox.profilesResetNotice
      );
      setTemplateInput(DEFAULT_BUILTIN_PROFILES[2].template);
      setEditingProfileId(null);
      setShowAddProfile(false);
    }
  };

  // Insert tag into active template
  const handleInsertTag = (tag: string) => {
    const updated =
      templateInput.endsWith(' ') || templateInput.length === 0
        ? `${templateInput}${tag}`
        : `${templateInput} ${tag}`;
    setTemplateInput(updated);
    onUpdateConfig({ template: updated });
  };

  // Insert tag into editing profile template
  const handleInsertTagToEdit = (tag: string) => {
    const updated =
      editTemplate.endsWith(' ') || editTemplate.length === 0
        ? `${editTemplate}${tag}`
        : `${editTemplate} ${tag}`;
    setEditTemplate(updated);
  };

  // Insert tag into new profile template
  const handleInsertTagToNew = (tag: string) => {
    const updated =
      newProfileTemplate.endsWith(' ') || newProfileTemplate.length === 0
        ? `${newProfileTemplate}${tag}`
        : `${newProfileTemplate} ${tag}`;
    setNewProfileTemplate(updated);
  };

  return (
    <div
      id="card-chatbox-settings"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-2">
              {t.chatboxSettings.title}
            </h2>
            <p className="text-xs text-slate-400">{t.chatboxSettings.subtitle}</p>
          </div>
        </div>

        {/* Master Active Broadcast Button */}
        <button
          id="btn-toggle-osc-master"
          type="button"
          onClick={() => onUpdateConfig({ enabled: !config.enabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer ${
            config.enabled
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {config.enabled ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>
            {config.enabled ? t.chatboxSettings.activeOscBtn : t.chatboxSettings.startOscBtn}
          </span>
        </button>
      </div>

      {/* Profiles section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.chatboxSettings.profilesTitle}</span>
            <span className="text-[10px] text-slate-500 font-mono">({profiles.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-reset-default-profiles"
              type="button"
              onClick={handleResetProfiles}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg border border-slate-700/80 transition-colors cursor-pointer"
              title={lang === 'de' ? 'Auf Standard-Profile zurücksetzen' : 'Reset to default profiles'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t.chatboxSettings.resetDefaultsBtn}</span>
            </button>

            <button
              id="btn-show-add-profile"
              type="button"
              onClick={handleOpenAddProfile}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 font-medium rounded-lg border border-blue-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.chatboxSettings.newProfileBtn}</span>
            </button>
          </div>
        </div>

        {/* Inline Create Profile Form */}
        {showAddProfile && (
          <form
            onSubmit={handleCreateProfile}
            className="p-4 bg-slate-950/90 border border-blue-500/40 rounded-xl space-y-3 shadow-lg ring-1 ring-blue-500/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                {t.chatboxSettings.createProfileTitle}
              </span>
              <button
                type="button"
                onClick={() => setShowAddProfile(false)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {t.chatboxSettings.profileNameLabel} <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-new-profile-name"
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder={t.chatboxSettings.profileNamePlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  {t.chatboxSettings.profileDescLabel}
                </label>
                <input
                  id="input-new-profile-desc"
                  type="text"
                  value={newProfileDesc}
                  onChange={(e) => setNewProfileDesc(e.target.value)}
                  placeholder={t.chatboxSettings.profileDescPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                {t.chatboxSettings.profileTemplateLabel}
              </label>
              <input
                id="input-new-profile-template"
                type="text"
                value={newProfileTemplate}
                onChange={(e) => setNewProfileTemplate(e.target.value)}
                placeholder="💓 {hr} BPM | 🎵 {song}"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tag shortcut pills for new profile */}
            <div className="flex flex-wrap gap-1">
              {templateVariables.slice(0, 6).map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertTagToNew(v.tag)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded border border-slate-700 cursor-pointer"
                >
                  {v.tag}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddProfile(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                id="btn-submit-create-profile"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.chatbox.saveProfileBtn}</span>
              </button>
            </div>
          </form>
        )}

        {/* Inline Edit Profile Form */}
        {editingProfileId && (
          <form
            onSubmit={handleSaveProfileEdit}
            className="p-4 bg-slate-950/95 border-2 border-indigo-500/50 rounded-xl space-y-3 shadow-xl ring-2 ring-indigo-500/20 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" />
                {t.chatboxSettings.editProfileTitle}
              </span>
              <button
                type="button"
                onClick={() => setEditingProfileId(null)}
                className="text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                  {t.chatboxSettings.profileNameLabel} <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-edit-profile-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                  {t.chatboxSettings.profileDescLabel}
                </label>
                <input
                  id="input-edit-profile-desc"
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder={t.chatboxSettings.profileDescPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-200">
                  {t.chatboxSettings.profileTemplateLabel}
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang === 'de' ? 'Nutze \\n für 2. Zeile' : 'Use \\n for 2nd line'}
                </span>
              </div>
              <textarea
                id="input-edit-profile-template"
                rows={2}
                value={editTemplate}
                onChange={(e) => setEditTemplate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Quick Tag Pills for Edit */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                {lang === 'de' ? 'Platzhalter einfügen:' : 'Insert tags:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {templateVariables.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => handleInsertTagToEdit(v.tag)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono rounded border border-slate-700 hover:border-indigo-400 transition-colors cursor-pointer"
                  >
                    {v.tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Action Buttons with Clear SAVE BUTTON */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProfileId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                id="btn-save-profile-edit"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-indigo-400/50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.chatboxSettings.saveProfileChanges}</span>
              </button>
            </div>
          </form>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {profiles.map((prof) => {
            const isSelected = prof.id === currentSelectedProfileId;
            const isEditing = prof.id === editingProfileId;

            return (
              <div
                key={prof.id}
                onClick={() => handleSelectProfile(prof)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-950/80'
                } ${isEditing ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Bookmark
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-blue-400' : 'text-slate-500'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {prof.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/40 shrink-0">
                          {t.common.active}
                        </span>
                      )}
                    </div>
                    {prof.description && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {prof.description}
                      </p>
                    )}
                  </div>

                  {/* Action buttons on card: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      id={`btn-edit-profile-${prof.id}`}
                      onClick={(e) => handleStartEditProfile(prof, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title={t.chatboxSettings.editTooltip}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {!prof.isBuiltIn && (
                      <button
                        type="button"
                        id={`btn-delete-profile-${prof.id}`}
                        onClick={(e) => handleDeleteProfile(prof.id, prof.name, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Template preview snippet */}
                <div className="bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800/80 text-[10px] text-slate-300 font-mono truncate">
                  {prof.template}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Format Template Editor Area */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.chatboxSettings.templateLabel}</span>
            {activeProfile && (
              <span className="text-[11px] font-normal text-slate-400">
                ({activeProfile.name})
              </span>
            )}
          </label>

          {hasUnsavedChanges && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              {t.chatboxSettings.unsavedChanges}
            </span>
          )}
        </div>

        {/* Input box */}
        <div className="space-y-1.5">
          <input
            id="input-chatbox-template"
            type="text"
            value={templateInput}
            onChange={(e) => {
              setTemplateInput(e.target.value);
              onUpdateConfig({ template: e.target.value });
            }}
            placeholder="💓 {hr} BPM 💓\n{song}"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Tag Chips */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 block">
            {t.chatbox.clickableVariables}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {templateVariables.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => handleInsertTag(v.tag)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700/80 hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>{v.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prominent Save / Adopt Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <div className="text-[11px] text-slate-400">
            {lang === 'de'
              ? 'Tipp: Klicke auf "Im Profil speichern", um den Text dauerhaft im Profil abzulegen.'
              : 'Tip: Click "Save to Profile" to persist your changes to the active preset.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-save-as-new-profile"
              type="button"
              onClick={handleOpenAddProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.chatboxSettings.saveAsNewBtn}</span>
            </button>

            <button
              id="btn-save-template-to-active-profile"
              type="button"
              onClick={handleSaveToActiveProfile}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-blue-400/50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {t.chatboxSettings.saveToProfileBtn} ({activeProfile?.name || 'Profil'})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Transmission Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        {/* Interval */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            {t.chatboxSettings.intervalLabel}
          </label>
          <select
            id="select-update-interval"
            value={config.updateIntervalMs || 1500}
            onChange={(e) => onUpdateConfig({ updateIntervalMs: Number(e.target.value) })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={1000}>1.0s ({lang === 'de' ? 'Sehr schnell' : 'Fast'})</option>
            <option value={1500}>1.5s ({lang === 'de' ? 'Empfohlen' : 'Recommended'})</option>
            <option value={2000}>2.0s</option>
            <option value={3000}>3.0s</option>
            <option value={5000}>5.0s</option>
          </select>
        </div>

        {/* Typing indicator */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer mt-4 sm:mt-0">
            <input
              id="toggle-bypass-typing"
              type="checkbox"
              checked={config.bypassTypingIndicator !== false}
              onChange={(e) => onUpdateConfig({ bypassTypingIndicator: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300">{t.chatboxSettings.bypassTyping}</span>
          </label>
        </div>

        {/* Sound */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer mt-2 sm:mt-0">
            <input
              id="toggle-play-sound"
              type="checkbox"
              checked={Boolean(config.playSound)}
              onChange={(e) => onUpdateConfig({ playSound: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300">{t.chatboxSettings.playSound}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
