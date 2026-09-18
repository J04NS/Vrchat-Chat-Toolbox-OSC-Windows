export type AppLanguage = 'en' | 'de';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    close: string;
    active: string;
    paused: string;
    connected: string;
    disconnected: string;
    error: string;
    optional: string;
    seconds: string;
    minutes: string;
    settingsSaved: string;
    loading: string;
  };
  header: {
    title: string;
    subtitle: string;
    badgeLinux: string;
    badgeWeb: string;
    linuxGuide: string;
    windowsGuide: string;
    oscActive: string;
    oscStopped: string;
    langSelect: string;
  };
  preview: {
    title: string;
    subtitle: string;
    liveSending: string;
    paused: string;
    afkMode: string;
    sendNow: string;
    sendNowBtn: string;
    chatboxBadge: string;
    soundOn: string;
    soundOff: string;
    directSendOn: string;
    charsCount: string;
    chars: string;
    overflowWarning: string;
    updateInterval: string;
    marqueeActive: string;
    staticText: string;
    autoProfileBadge: string;
    broadcasting: string;
    vrchatHud: string;
    intervalSec: string;
    emptyNotice: string;
  };
  chatboxSettings: {
    title: string;
    subtitle: string;
    activeOscBtn: string;
    startOscBtn: string;
    profilesTitle: string;
    newProfileBtn: string;
    createProfileTitle: string;
    editProfileTitle: string;
    profileNamePlaceholder: string;
    profileNameLabel: string;
    profileDescLabel: string;
    profileDescPlaceholder: string;
    profileTemplateLabel: string;
    templateLabel: string;
    saveToProfileBtn: string;
    saveProfileChanges: string;
    saveAsNewBtn: string;
    resetDefaultsBtn: string;
    intervalLabel: string;
    bypassTyping: string;
    playSound: string;
    editTooltip: string;
    unsavedChanges: string;
    profileUpdatedNotice: string;
    templateSavedNotice: string;
  };
  chatbox: {
    title: string;
    subtitle: string;
    startBroadcast: string;
    stopBroadcast: string;
    profilesTitle: string;
    profilesAvailable: string;
    saveAsProfile: string;
    closeProfileForm: string;
    resetProfiles: string;
    resetProfilesTooltip: string;
    saveCurrentModalTitle: string;
    profileNamePlaceholder: string;
    profileDescPlaceholder: string;
    profileTemplateLabel: string;
    saveProfileBtn: string;
    activeProfileBadge: string;
    autoActiveBadge: string;
    automationActiveBanner: string;
    deleteProfileTooltip: string;
    activeChatboxText: string;
    adoptToProfile: string;
    clickableVariables: string;
    variables: {
      hr: string;
      hrIcon: string;
      song: string;
      cpu: string;
      ram: string;
      hw: string;
      afkTime: string;
      freitext: string;
      clock: string;
      newline: string;
    };
    sendInterval: string;
    bypassTyping: string;
    profileLoadedNotice: string;
    profileSavedNotice: string;
    profileDeletedNotice: string;
    profilesResetNotice: string;
    profileAdoptedNotice: string;
  };
  heartRate: {
    title: string;
    subtitle: string;
    liveRate: string;
    noBpm: string;
    zones: {
      resting: string;
      normal: string;
      elevated: string;
      high: string;
      max: string;
    };
    tabs: {
      hyperate: string;
      pulsoid: string;
      ble: string;
      sim: string;
      manual: string;
    };
    hyperate: {
      sessionLabel: string;
      sessionPlaceholder: string;
      connectBtn: string;
      disconnectBtn: string;
      connecting: string;
      statusLabel: string;
      statusConnected: string;
      statusConnecting: string;
      statusDisconnected: string;
      description: string;
      guide: string;
      relayServerLabel: string;
      relayPlaceholder: string;
      relayNotice: string;
      upstreamConnected: string;
      upstreamConnecting: string;
      appHint: string;
    };
    pulsoid: {
      tokenLabel: string;
      connectBtn: string;
      disconnectBtn: string;
      hint: string;
      statusConnected: string;
      statusConnecting: string;
      noTokenEntered: string;
      tokenPlaceholder: string;
      tokenHelp: string;
      tokenLink: string;
      savedNotification: string;
    };
    ble: {
      title: string;
      desc: string;
      connectBtn: string;
      disconnectBtn: string;
    };
    sim: {
      title: string;
      sliderLabel: string;
      startBtn: string;
      stopBtn: string;
    };
    manual: {
      title: string;
      inputLabel: string;
      setBtn: string;
    };
  };
  media: {
    title: string;
    subtitle: string;
    playing: string;
    paused: string;
    autoDetect: string;
    autoDetectDesc: string;
    onlyWhenPlaying: string;
    onlyWhenPlayingDesc: string;
    manualInputTitle: string;
    songTitlePlaceholder: string;
    artistPlaceholder: string;
    setSongBtn: string;
    playerctlActive: string;
    playerctlInactive: string;
    nowPlaying: string;
    stopped: string;
    noMedia: string;
    titleLabel: string;
    artistLabel: string;
    albumLabel: string;
    sourceLabel: string;
    autoDetectToggle: string;
    onlyWhenPlayingToggle: string;
    manualHeading: string;
    saveMediaBtn: string;
    clearMediaBtn: string;
  };
  hardwareStats: {
    title: string;
    subtitle: string;
    active: string;
    inactive: string;
    availableTags: string;
  };
  hardware: {
    title: string;
    subtitle: string;
    toggleEnable: string;
    cpu: string;
    ram: string;
    gpu: string;
    temp: string;
    statsActive: string;
    statsDisabled: string;
  };
  afk: {
    title: string;
    subtitle: string;
    isAfk: string;
    isOnline: string;
    active: string;
    inactive: string;
    modeLabel: string;
    modeBoth: string;
    modeOscOnly: string;
    modeTimerOnly: string;
    timeoutLabel: string;
    overrideTitle: string;
    overrideDesc: string;
    templateLabel: string;
    afkActive: string;
    onlineActive: string;
    timeoutMinutes: string;
    customTemplateLabel: string;
    overrideChatboxLabel: string;
    overrideChatboxDesc: string;
    placeholderTemplate: string;
  };
  customTexts: {
    title: string;
    subtitle: string;
    activeCount: string;
    addBtn: string;
    addTextBtn: string;
    intervalLabel: string;
    intervalDesc: string;
    variableHint: string;
    inputPlaceholder: string;
    activeNowBadge: string;
  };
  oscNetwork: {
    title: string;
    subtitle: string;
    targetAddress: string;
    port: string;
    updateTargetBtn: string;
    sendTestBtn: string;
    clearLogsBtn: string;
    logsTitle: string;
    packetsSent: string;
    noLogsYet: string;
    logsClearedNotice: string;
    testPacketSentNotice: string;
  };
  linuxModal: {
    title: string;
    subtitle: string;
    closeBtn: string;
    tabs: {
      quickstart: string;
      steamdeck: string;
      systemd: string;
      playerctl: string;
    };
  };
  windowsModal: {
    title: string;
    subtitle: string;
    closeBtn: string;
  };
  notifications: {
    oscStarted: string;
    oscStopped: string;
    configSaved: string;
  };
  profileAutomation: {
    title: string;
    subtitle: string;
    masterToggle: string;
    activeStatus: string;
    pausedStatus: string;
    currentRuleBanner: string;
    noRuleMatchedBanner: string;
    liveState: string;
    liveHrActive: string;
    liveHrInactive: string;
    liveMediaPlaying: string;
    liveMediaStopped: string;
    liveAfkYes: string;
    liveAfkNo: string;
    addRuleBtn: string;
    saveRuleBtn: string;
    cancelBtn: string;
    newRuleTitle: string;
    editRuleTitle: string;
    ruleNameLabel: string;
    ruleNamePlaceholder: string;
    conditionHrLabel: string;
    conditionMediaLabel: string;
    conditionAfkLabel: string;
    optTrue: string;
    optFalse: string;
    optAny: string;
    targetProfileLabel: string;
    rulesListTitle: string;
    noRulesYet: string;
    ruleMatchedNow: string;
    deleteTooltip: string;
    editTooltip: string;
    moveUpTooltip: string;
    moveDownTooltip: string;
    resetDefaultRulesBtn: string;
    resetNotice: string;
    savedNotice: string;
  };
}

export const translations: Record<AppLanguage, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',
      active: 'Active',
      paused: 'Paused',
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
      optional: 'Optional',
      seconds: 'seconds',
      minutes: 'minutes',
      settingsSaved: 'Settings saved!',
      loading: 'Loading...',
    },
    header: {
      title: 'VRChat OSC Chatbox Hub (Windows & Linux)',
      subtitle: 'Heart Rate • Spotify & Media • Profile Automation • Hardware Monitor • AFK',
      badgeLinux: 'OSC Ingress 9001',
      badgeWeb: 'Target: 127.0.0.1:9000',
      linuxGuide: 'Linux Guide',
      windowsGuide: 'Windows Guide',
      oscActive: 'OSC ACTIVE',
      oscStopped: 'OSC PAUSED',
      langSelect: 'Language Selection',
    },
    preview: {
      title: 'VRChat Chatbox Live Preview',
      subtitle: 'Real-time rendering of your in-game chatbox message',
      liveSending: 'Broadcasting Live',
      paused: 'Broadcasting Paused',
      afkMode: 'AFK Override Active',
      sendNow: 'Send to VRChat Now',
      sendNowBtn: 'Send Now',
      chatboxBadge: 'VRChat OSC Preview',
      soundOn: 'Sound enabled',
      soundOff: 'Muted',
      directSendOn: 'Instant send',
      charsCount: 'characters',
      chars: 'chars',
      overflowWarning: 'VRChat truncates messages exceeding 144 characters.',
      updateInterval: 'Send interval',
      marqueeActive: 'Marquee scrolling active',
      staticText: 'Static text',
      autoProfileBadge: 'Rule Active',
      broadcasting: 'Broadcasting',
      vrchatHud: 'VRChat OSC Chatbox',
      intervalSec: 'interval',
      emptyNotice: 'Chatbox message is currently empty.',
    },
    chatboxSettings: {
      title: 'Chatbox Format & Profiles',
      subtitle: 'Customize format templates and profile switches',
      activeOscBtn: 'OSC Broadcast Active',
      startOscBtn: 'Start OSC Broadcast',
      profilesTitle: 'Presets & Format Profiles',
      newProfileBtn: 'New Profile',
      createProfileTitle: 'Create New Profile',
      editProfileTitle: 'Edit Profile',
      profileNamePlaceholder: 'Profile Name (e.g. Rave / Chill)',
      profileNameLabel: 'Profile Name',
      profileDescLabel: 'Description (optional)',
      profileDescPlaceholder: 'e.g. No heart rate, only song & clock',
      profileTemplateLabel: 'Format Template',
      templateLabel: 'Active Format Template',
      saveToProfileBtn: 'Save to Active Profile',
      saveProfileChanges: 'Save Profile Changes',
      saveAsNewBtn: 'Save as New Profile',
      resetDefaultsBtn: 'Restore Defaults',
      intervalLabel: 'Broadcast Interval',
      bypassTyping: 'Instant (Bypass typing bubble)',
      playSound: 'Notification sound',
      editTooltip: 'Edit Profile Details',
      unsavedChanges: 'Unsaved template changes',
      profileUpdatedNotice: 'Profile updated successfully!',
      templateSavedNotice: 'Template saved to profile!',
    },
    chatbox: {
      title: 'Chatbox Format & Profiles',
      subtitle: 'Customize templates and profile triggers',
      startBroadcast: 'Start OSC Output',
      stopBroadcast: 'Pause OSC Output',
      profilesTitle: 'Presets & Profiles',
      profilesAvailable: 'available',
      saveAsProfile: '+ Save As New Profile',
      closeProfileForm: 'Close Form',
      resetProfiles: 'Reset Defaults',
      resetProfilesTooltip: 'Restore default built-in profiles',
      saveCurrentModalTitle: 'Save Current Template as Profile',
      profileNamePlaceholder: 'Profile Name (e.g., Chill Music, Rave Night)',
      profileDescPlaceholder: 'Short description (optional)',
      profileTemplateLabel: 'Format Template',
      saveProfileBtn: 'Save Profile',
      activeProfileBadge: 'Active Profile',
      autoActiveBadge: 'Automated Profile',
      automationActiveBanner: 'Automated profile rule active:',
      deleteProfileTooltip: 'Delete Profile',
      activeChatboxText: 'Chatbox Template',
      adoptToProfile: 'Overwrite Profile',
      clickableVariables: 'Clickable Placeholders & Tags:',
      variables: {
        hr: 'Heart Rate BPM',
        hrIcon: 'Heart Pulse Icon',
        song: 'Song Title & Artist',
        cpu: 'CPU Usage %',
        ram: 'RAM Usage %',
        hw: 'Hardware Summary',
        afkTime: 'AFK Timer',
        freitext: 'Rotating Text',
        clock: 'Clock HH:MM',
        newline: 'New Line (\\n)',
      },
      sendInterval: 'Send Interval',
      bypassTyping: 'Instant Send (Bypass typing bubble)',
      profileLoadedNotice: 'Profile loaded',
      profileSavedNotice: 'Profile saved successfully',
      profileDeletedNotice: 'Profile deleted',
      profilesResetNotice: 'Profiles reset to default presets',
      profileAdoptedNotice: 'Profile updated with current template',
    },
    heartRate: {
      title: 'Heart Rate Monitor',
      subtitle: 'Real-time BPM integration for VRChat',
      liveRate: 'Live BPM',
      noBpm: 'Waiting for heart rate...',
      zones: {
        resting: 'Resting',
        normal: 'Normal',
        elevated: 'Elevated',
        high: 'Cardio',
        max: 'Peak',
      },
      tabs: {
        hyperate: 'HypeRate',
        pulsoid: 'Pulsoid',
        ble: 'Bluetooth BLE',
        sim: 'Simulator',
        manual: 'Manual',
      },
      hyperate: {
        sessionLabel: 'HypeRate Session ID',
        sessionPlaceholder: 'e.g. 1234 or a1b2',
        connectBtn: 'Connect HypeRate',
        disconnectBtn: 'Disconnect',
        connecting: 'Connecting...',
        statusLabel: 'Connection Status',
        statusConnected: 'Connected to Pelikan Relay',
        statusConnecting: 'Connecting to Pelikan Relay...',
        statusDisconnected: 'Disconnected (Enter Session ID)',
        description: 'Connects to your HypeRate app via the pre-configured Pelikan Relay server.',
        guide: 'How to find your Session ID:',
        relayServerLabel: 'Pelikan Relay Server',
        relayPlaceholder: 'ws://164.30.71.45:7871',
        relayNotice: 'Connected securely through Pelikan Relay.',
        upstreamConnected: 'Upstream connected',
        upstreamConnecting: 'Connecting to upstream...',
        appHint: 'Open the HypeRate app on your phone or smartwatch and copy your Session ID.',
      },
      pulsoid: {
        tokenLabel: 'Pulsoid Token or Widget URL',
        connectBtn: 'Connect Pulsoid',
        disconnectBtn: 'Disconnect',
        hint: 'Paste your Pulsoid Widget Link or Access Token.',
        statusConnected: 'Connected to Pulsoid Real-Time Feed',
        statusConnecting: 'Connecting to Pulsoid Feed...',
        noTokenEntered: 'Disconnected (Enter Token)',
        tokenPlaceholder: 'e.g. https://pulsoid.net/widget/view/... or Token',
        tokenHelp: 'Get your link from the Pulsoid dashboard (Widgets).',
        tokenLink: 'Open Pulsoid Dashboard',
        savedNotification: 'Pulsoid Token saved!',
      },
      ble: {
        title: 'Bluetooth Low Energy (Web Bluetooth)',
        desc: 'Connect standard Bluetooth heart rate chest straps and armbands directly.',
        connectBtn: 'Pair BLE Device',
        disconnectBtn: 'Disconnect BLE',
      },
      sim: {
        title: 'Heart Rate Simulator',
        sliderLabel: 'Simulate BPM Value',
        startBtn: 'Start Simulator',
        stopBtn: 'Stop Simulator',
      },
      manual: {
        title: 'Manual Heart Rate Input',
        inputLabel: 'Set Fixed BPM',
        setBtn: 'Set BPM',
      },
    },
    media: {
      title: 'Spotify & Media Detection',
      subtitle: 'Automatic track title and artist recognition',
      playing: 'Playing',
      paused: 'Paused',
      autoDetect: 'Automatic media detection',
      autoDetectDesc: 'Detect Spotify & Windows Media player',
      onlyWhenPlaying: 'Hide media when stopped/paused',
      onlyWhenPlayingDesc: 'Clears song title when playback stops',
      manualInputTitle: 'Manual Track Input',
      songTitlePlaceholder: 'Song Title',
      artistPlaceholder: 'Artist (optional)',
      setSongBtn: 'Set Track',
      playerctlActive: 'Media detection active',
      playerctlInactive: 'Media detection inactive',
      nowPlaying: 'Now Playing',
      stopped: 'Playback stopped',
      noMedia: 'No media player found',
      titleLabel: 'Track Title',
      artistLabel: 'Artist',
      albumLabel: 'Album',
      sourceLabel: 'Media Source',
      autoDetectToggle: 'Auto-detection',
      onlyWhenPlayingToggle: 'Hide when paused',
      manualHeading: 'Manual Media Control',
      saveMediaBtn: 'Apply Track',
      clearMediaBtn: 'Clear',
    },
    hardwareStats: {
      title: 'Hardware Monitor (Windows & Linux)',
      subtitle: 'Live CPU, RAM and GPU telemetry',
      active: 'Monitoring Active',
      inactive: 'Disabled',
      availableTags: 'Available Telemetry Tags:',
    },
    hardware: {
      title: 'Hardware Monitoring',
      subtitle: 'CPU, RAM and GPU telemetry',
      toggleEnable: 'Enable hardware stats',
      cpu: 'CPU Usage',
      ram: 'RAM Usage',
      gpu: 'GPU Usage',
      temp: 'Temperature',
      statsActive: 'Telemetry Active',
      statsDisabled: 'Telemetry Disabled',
    },
    afk: {
      title: 'AFK & Inactivity Detection',
      subtitle: 'Automatic AFK status from VRChat OSC Ingress or timer',
      isAfk: 'AFK Active',
      isOnline: 'Online',
      active: 'AFK Detection Active',
      inactive: 'Disabled',
      modeLabel: 'Detection Mode',
      modeBoth: 'VRChat OSC Parameter + Inactivity Timer',
      modeOscOnly: 'VRChat OSC Avatar AFK Parameter Only',
      modeTimerOnly: 'Inactivity Timer Only',
      timeoutLabel: 'Inactivity Timeout',
      overrideTitle: 'Override Chatbox during AFK',
      overrideDesc: 'Displays AFK status message while inactive',
      templateLabel: 'AFK Message Format',
      afkActive: 'AFK Active',
      onlineActive: 'Player Online',
      timeoutMinutes: 'Timeout (minutes)',
      customTemplateLabel: 'AFK Template',
      overrideChatboxLabel: 'Override Chatbox when AFK',
      overrideChatboxDesc: 'Switches chatbox to AFK text automatically',
      placeholderTemplate: 'AFK template',
    },
    customTexts: {
      title: 'Rotating Custom Status Texts',
      subtitle: 'Cycle through custom messages with {freitext}',
      activeCount: 'active',
      addBtn: '+ Add Text',
      addTextBtn: '+ Add Text',
      intervalLabel: 'Rotation Interval',
      intervalDesc: 'Time before switching to next custom text',
      variableHint: 'Insert {freitext} in your format template to display these texts.',
      inputPlaceholder: 'Enter custom text...',
      activeNowBadge: 'Displaying now',
    },
    oscNetwork: {
      title: 'OSC Network & Logs',
      subtitle: 'UDP target settings and live packet transmission log',
      targetAddress: 'Target IP Address',
      port: 'OSC Port',
      updateTargetBtn: 'Save Target',
      sendTestBtn: 'Send Test Packet',
      clearLogsBtn: 'Clear Logs',
      logsTitle: 'Live Transmission Log',
      packetsSent: 'Packets Sent',
      noLogsYet: 'No OSC packets sent yet.',
      logsClearedNotice: 'Logs cleared.',
      testPacketSentNotice: 'Test packet sent to VRChat!',
    },
    linuxModal: {
      title: 'Linux & Steam Deck Setup Guide',
      subtitle: 'Instructions for Ubuntu, Arch, Fedora, and SteamOS',
      closeBtn: 'Got it',
      tabs: {
        quickstart: 'Quickstart',
        steamdeck: 'Steam Deck',
        systemd: 'Autostart Service',
        playerctl: 'Spotify & Media',
      },
    },
    windowsModal: {
      title: 'Windows Setup Guide',
      subtitle: 'Instructions for Windows 10 & 11',
      closeBtn: 'Got it',
    },
    notifications: {
      oscStarted: 'OSC broadcast started! 🚀',
      oscStopped: 'OSC broadcast paused ⏸️',
      configSaved: 'Configuration saved!',
    },
    profileAutomation: {
      title: 'Automated Profile Rules (If-Then)',
      subtitle: 'Automatically switch chatbox format profiles based on conditions',
      masterToggle: 'Profile Automation',
      activeStatus: 'Active',
      pausedStatus: 'Inactive',
      currentRuleBanner: 'Active Rule:',
      noRuleMatchedBanner: 'No rule matched (using active profile)',
      liveState: 'Live State:',
      liveHrActive: 'Heart Rate: Active',
      liveHrInactive: 'Heart Rate: Inactive',
      liveMediaPlaying: 'Media: Playing',
      liveMediaStopped: 'Media: Stopped',
      liveAfkYes: 'AFK: Yes',
      liveAfkNo: 'AFK: No',
      addRuleBtn: '+ New Rule',
      saveRuleBtn: 'Save Rule',
      cancelBtn: 'Cancel',
      newRuleTitle: 'Create New Automation Rule',
      editRuleTitle: 'Edit Automation Rule',
      ruleNameLabel: 'Rule Name',
      ruleNamePlaceholder: 'e.g. Heart Rate Off & Music On ➔ Profile 1',
      conditionHrLabel: 'Heart Rate Condition',
      conditionMediaLabel: 'Media Condition',
      conditionAfkLabel: 'AFK Condition',
      optTrue: 'Must be ON / Active',
      optFalse: 'Must be OFF / Inactive',
      optAny: 'Any / Ignore condition',
      targetProfileLabel: 'Target Profile to activate',
      rulesListTitle: 'Configured Automation Rules (Evaluated in order)',
      noRulesYet: 'No automation rules defined.',
      ruleMatchedNow: 'Currently matched & applied!',
      deleteTooltip: 'Delete Rule',
      editTooltip: 'Edit Rule',
      moveUpTooltip: 'Move Up',
      moveDownTooltip: 'Move Down',
      resetDefaultRulesBtn: 'Restore Default Rules',
      resetNotice: 'Rules reset to defaults!',
      savedNotice: 'Automation rules saved!',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      close: 'Schließen',
      active: 'Aktiv',
      paused: 'Pausiert',
      connected: 'Verbunden',
      disconnected: 'Getrennt',
      error: 'Fehler',
      optional: 'Optional',
      seconds: 'Sekunden',
      minutes: 'Minuten',
      settingsSaved: 'Einstellungen gespeichert!',
      loading: 'Lädt...',
    },
    header: {
      title: 'VRChat OSC Chatbox Hub (Windows & Linux)',
      subtitle: 'Puls • Spotify & Medien • Profil-Automatisierung • Hardware • AFK',
      badgeLinux: 'OSC Ingress 9001',
      badgeWeb: 'Ziel: 127.0.0.1:9000',
      linuxGuide: 'Linux Anleitung',
      windowsGuide: 'Windows Anleitung',
      oscActive: 'OSC AKTIV',
      oscStopped: 'OSC PAUSIERT',
      langSelect: 'Sprachauswahl',
    },
    preview: {
      title: 'VRChat Chatbox Live-Vorschau',
      subtitle: 'Echtzeit-Darstellung deiner Chatbox-Nachricht im Spiel',
      liveSending: 'Sendet Live an VRChat',
      paused: 'Übertragung pausiert',
      afkMode: 'AFK-Überschreibung aktiv',
      sendNow: 'Jetzt an VRChat senden',
      sendNowBtn: 'Jetzt senden',
      chatboxBadge: 'VRChat OSC Vorschau',
      soundOn: 'Sound aktiviert',
      soundOff: 'Stumm',
      directSendOn: 'Direktsenden',
      charsCount: 'Zeichen',
      chars: 'Zeichen',
      overflowWarning: 'VRChat schneidet Texte über 144 Zeichen im Spiel ab.',
      updateInterval: 'Sende-Intervall',
      marqueeActive: 'Laufschrift aktiv',
      staticText: 'Statischer Text',
      autoProfileBadge: 'Regel Aktiv',
      broadcasting: 'Überträgt',
      vrchatHud: 'VRChat OSC Chatbox',
      intervalSec: 'Intervall',
      emptyNotice: 'Chatbox-Nachricht ist derzeit leer.',
    },
    chatboxSettings: {
      title: 'Chatbox Format & Profile',
      subtitle: 'Formatvorlagen anpassen und Profile wechseln',
      activeOscBtn: 'OSC-Übertragung Aktiv',
      startOscBtn: 'OSC-Übertragung starten',
      profilesTitle: 'Profile & Formatvorlagen',
      newProfileBtn: 'Neues Profil',
      createProfileTitle: 'Neues Profil anlegen',
      editProfileTitle: 'Profil bearbeiten',
      profileNamePlaceholder: 'Profilname (z.B. Rave / Chill)',
      profileNameLabel: 'Profilname',
      profileDescLabel: 'Beschreibung (optional)',
      profileDescPlaceholder: 'z.B. Kein Puls, nur Musik & Uhrzeit',
      profileTemplateLabel: 'Formatvorlage',
      templateLabel: 'Aktive Formatvorlage',
      saveToProfileBtn: 'Im aktiven Profil speichern',
      saveProfileChanges: 'Profil-Änderungen speichern',
      saveAsNewBtn: 'Als neues Profil anlegen',
      resetDefaultsBtn: 'Standard-Profile',
      intervalLabel: 'Sende-Intervall',
      bypassTyping: 'Direkt (Tipp-Blase überspringen)',
      playSound: 'Benachrichtigungssound',
      editTooltip: 'Profil bearbeiten',
      unsavedChanges: 'Ungespeicherte Änderungen',
      profileUpdatedNotice: 'Profil erfolgreich gespeichert!',
      templateSavedNotice: 'Vorlage im aktiven Profil gespeichert!',
    },
    chatbox: {
      title: 'Chatbox Format & Profile',
      subtitle: 'Formatvorlagen anpassen und Profile wechseln',
      startBroadcast: 'OSC-Übertragung starten',
      stopBroadcast: 'OSC-Übertragung pausieren',
      profilesTitle: 'Profile & Vorlagen',
      profilesAvailable: 'verfügbar',
      saveAsProfile: '+ Als neues Profil speichern',
      closeProfileForm: 'Formular schließen',
      resetProfiles: 'Auf Standard-Profile zurücksetzen',
      resetProfilesTooltip: 'Setzt alle Profile auf die 6 Standardvorlagen zurück',
      saveCurrentModalTitle: 'Aktuelle Vorlage als Profil speichern',
      profileNamePlaceholder: 'Profilname (z.B. Chill Musik, Rave Nacht)',
      profileDescPlaceholder: 'Kurze Beschreibung (optional)',
      profileTemplateLabel: 'Formatvorlage',
      saveProfileBtn: 'Profil anlegen',
      activeProfileBadge: 'Aktives Profil',
      autoActiveBadge: 'Automatisches Profil',
      automationActiveBanner: 'Automatisches Profil aktiv durch Regel:',
      deleteProfileTooltip: 'Profil löschen',
      activeChatboxText: 'Aktive Chatbox-Formatvorlage',
      adoptToProfile: 'In Profil übernehmen',
      clickableVariables: 'Klickbare Platzhalter & Tags:',
      variables: {
        hr: 'Herzfrequenz BPM',
        hrIcon: 'Pulsierendes Herz Icon',
        song: 'Songtitel & Interpret',
        cpu: 'CPU-Auslastung %',
        ram: 'RAM-Auslastung %',
        hw: 'Hardware Übersicht',
        afkTime: 'AFK Timer',
        freitext: 'Rotierender Text',
        clock: 'Uhrzeit HH:MM',
        newline: 'Neue Zeile (\\n)',
      },
      sendInterval: 'Sende-Intervall',
      bypassTyping: 'Sofort senden (Tipp-Indikator überspringen)',
      profileLoadedNotice: 'Profil geladen',
      profileSavedNotice: 'Profil erfolgreich gespeichert',
      profileDeletedNotice: 'Profil gelöscht',
      profilesResetNotice: 'Profile auf Standard-Vorlagen zurückgesetzt',
      profileAdoptedNotice: 'Profil mit aktuellem Format aktualisiert',
    },
    heartRate: {
      title: 'Herzfrequenz Sensor',
      subtitle: 'Echtzeit-Puls-Integration für VRChat',
      liveRate: 'Live Puls',
      noBpm: 'Warte auf Herzfrequenz...',
      zones: {
        resting: 'Ruhe',
        normal: 'Normal',
        elevated: 'Erhöht',
        high: 'Cardio',
        max: 'Peak',
      },
      tabs: {
        hyperate: 'HypeRate',
        pulsoid: 'Pulsoid',
        ble: 'Bluetooth BLE',
        sim: 'Simulator',
        manual: 'Manuell',
      },
      hyperate: {
        sessionLabel: 'HypeRate Session ID',
        sessionPlaceholder: 'z.B. 1234 oder a1b2',
        connectBtn: 'Mit HypeRate verbinden',
        disconnectBtn: 'Trennen',
        connecting: 'Verbinde...',
        statusLabel: 'Verbindungsstatus',
        statusConnected: 'Verbunden mit Pelikan Server',
        statusConnecting: 'Verbinde mit Pelikan Server...',
        statusDisconnected: 'Getrennt (Session ID eingeben)',
        description: 'Verbindet sich über den vorkonfigurierten Pelikan Relay Server direkt mit deiner HypeRate App.',
        guide: 'So findest du deine Session ID:',
        relayServerLabel: 'Pelikan Relay Server',
        relayPlaceholder: 'ws://164.30.71.45:7871',
        relayNotice: 'Verbindung läuft geschützt über den internen Pelikan Server.',
        upstreamConnected: 'Upstream verbunden',
        upstreamConnecting: 'Verbinde mit Upstream...',
        appHint: 'Öffne die HypeRate App auf deinem Smartphone oder deiner Smartwatch und kopiere die angezeigte Session ID.',
      },
      pulsoid: {
        tokenLabel: 'Pulsoid Token oder Widget-URL',
        connectBtn: 'Mit Pulsoid verbinden',
        disconnectBtn: 'Trennen',
        hint: 'Füge deinen Pulsoid Widget-Link oder Access Token ein.',
        statusConnected: 'Verbunden mit Pulsoid Real-Time Feed',
        statusConnecting: 'Verbinde mit Pulsoid Feed...',
        noTokenEntered: 'Getrennt (Token eingeben)',
        tokenPlaceholder: 'z.B. https://pulsoid.net/widget/view/... oder Token',
        tokenHelp: 'Erstelle deinen Link im Pulsoid Dashboard (Widgets).',
        tokenLink: 'Pulsoid Dashboard öffnen',
        savedNotification: 'Pulsoid Token gespeichert!',
      },
      ble: {
        title: 'Bluetooth Low Energy (Web Bluetooth)',
        desc: 'Direkte Verbindung zu Bluetooth-Brustgurten und Armbändern.',
        connectBtn: 'BLE-Gerät koppeln',
        disconnectBtn: 'BLE trennen',
      },
      sim: {
        title: 'Puls-Simulator',
        sliderLabel: 'BPM-Wert simulieren',
        startBtn: 'Simulator starten',
        stopBtn: 'Simulator stoppen',
      },
      manual: {
        title: 'Manuelle Pulswerte',
        inputLabel: 'Festen BPM-Wert setzen',
        setBtn: 'BPM setzen',
      },
    },
    media: {
      title: 'Spotify & Medien-Erkennung',
      subtitle: 'Automatische Songtitel- und Interpreten-Erkennung',
      playing: 'Wiedergabe',
      paused: 'Pausiert',
      autoDetect: 'Automatische Medienerkennung',
      autoDetectDesc: 'Erkennt Spotify & Windows-Medienplayer',
      onlyWhenPlaying: 'Nur bei aktiver Wiedergabe anzeigen',
      onlyWhenPlayingDesc: 'Blendet Songtitel aus, wenn pausiert',
      manualInputTitle: 'Manuelle Song-Eingabe',
      songTitlePlaceholder: 'Songtitel',
      artistPlaceholder: 'Interpret (optional)',
      setSongBtn: 'Song setzen',
      playerctlActive: 'Medienerkennung aktiv',
      playerctlInactive: 'Medienerkennung inaktiv',
      nowPlaying: 'Aktuelle Wiedergabe',
      stopped: 'Wiedergabe gestoppt',
      noMedia: 'Kein Medienplayer erkannt',
      titleLabel: 'Songtitel',
      artistLabel: 'Interpret',
      albumLabel: 'Album',
      sourceLabel: 'Medienquelle',
      autoDetectToggle: 'Automatische Erkennung',
      onlyWhenPlayingToggle: 'Nur bei Wiedergabe senden',
      manualHeading: 'Manuelle Steuerung',
      saveMediaBtn: 'Song übernehmen',
      clearMediaBtn: 'Zurücksetzen',
    },
    hardwareStats: {
      title: 'Hardware Überwachung (Windows & Linux)',
      subtitle: 'Live CPU, RAM und GPU Telemetrie',
      active: 'Überwachung Aktiv',
      inactive: 'Deaktiviert',
      availableTags: 'Verfügbare Telemetrie-Tags:',
    },
    hardware: {
      title: 'Hardware Überwachung',
      subtitle: 'CPU, RAM und GPU Telemetrie',
      toggleEnable: 'Hardware-Telemetrie aktivieren',
      cpu: 'CPU-Auslastung',
      ram: 'RAM-Auslastung',
      gpu: 'GPU-Auslastung',
      temp: 'Temperatur',
      statsActive: 'Telemetrie Aktiv',
      statsDisabled: 'Telemetrie Deaktiviert',
    },
    afk: {
      title: 'AFK & Inaktivitäts-Erkennung',
      subtitle: 'Automatische Erkennung via VRChat OSC Ingress oder Timer',
      isAfk: 'AFK Aktiv',
      isOnline: 'Online',
      active: 'AFK-Erkennung Aktiv',
      inactive: 'Deaktiviert',
      modeLabel: 'Erkennungsmodus',
      modeBoth: 'VRChat OSC Parameter + Inaktivitäts-Timer',
      modeOscOnly: 'Nur VRChat Avatar AFK Parameter',
      modeTimerOnly: 'Nur Inaktivitäts-Timer',
      timeoutLabel: 'Inaktivitäts-Zeitspanne',
      overrideTitle: 'Chatbox bei AFK überschreiben',
      overrideDesc: 'Sendet automatisch AFK-Nachricht bei Inaktivität',
      templateLabel: 'AFK-Nachrichtenformat',
      afkActive: 'AFK Status Aktiv',
      onlineActive: 'Spieler Aktiv',
      timeoutMinutes: 'Timeout (Minuten)',
      customTemplateLabel: 'AFK-Formatvorlage',
      overrideChatboxLabel: 'Chatbox überschreiben bei AFK',
      overrideChatboxDesc: 'Wechselt bei AFK automatisch zum AFK-Text',
      placeholderTemplate: 'AFK-Vorlage',
    },
    customTexts: {
      title: 'Rotierende Freitexte & Status',
      subtitle: 'Texte wechseln automatisch durch mit {freitext}',
      activeCount: 'aktiv',
      addBtn: '+ Text hinzufügen',
      addTextBtn: '+ Text hinzufügen',
      intervalLabel: 'Rotations-Intervall',
      intervalDesc: 'Zeitspanne bis zum nächsten Text',
      variableHint: 'Füge {freitext} in deine Formatvorlage ein, um diese Texte anzuzeigen.',
      inputPlaceholder: 'Freitext eingeben...',
      activeNowBadge: 'Wird aktuell angezeigt',
    },
    oscNetwork: {
      title: 'OSC Netzwerk & Logs',
      subtitle: 'UDP-Zieleinstellungen und Live-Übertragungsprotokoll',
      targetAddress: 'Ziel-IP-Adresse',
      port: 'OSC Port',
      updateTargetBtn: 'Ziel speichern',
      sendTestBtn: 'Test-Paket senden',
      clearLogsBtn: 'Logs leeren',
      logsTitle: 'Live Übertragungsprotokoll',
      packetsSent: 'Pakete gesendet',
      noLogsYet: 'Noch keine OSC-Pakete versendet.',
      logsClearedNotice: 'Logs geleert.',
      testPacketSentNotice: 'Test-Paket an VRChat gesendet!',
    },
    linuxModal: {
      title: 'Linux & Steam Deck Anleitung',
      subtitle: 'Anleitung für Ubuntu, Arch, Fedora und SteamOS',
      closeBtn: 'Verstanden',
      tabs: {
        quickstart: 'Schnellstart',
        steamdeck: 'Steam Deck',
        systemd: 'Autostart-Dienst',
        playerctl: 'Spotify & Medien',
      },
    },
    windowsModal: {
      title: 'Windows Anleitung',
      subtitle: 'Anleitung für Windows 10 & 11',
      closeBtn: 'Verstanden',
    },
    notifications: {
      oscStarted: 'OSC-Übertragung gestartet! 🚀',
      oscStopped: 'OSC-Übertragung pausiert ⏸️',
      configSaved: 'Einstellungen gespeichert!',
    },
    profileAutomation: {
      title: 'Automatisierte Profil-Bedingungen (Wenn-Dann)',
      subtitle: 'Wechselt Format-Profile automatisch anhand von Puls, Musik & AFK',
      masterToggle: 'Profil-Automatisierung',
      activeStatus: 'Aktiv',
      pausedStatus: 'Inaktiv',
      currentRuleBanner: 'Aktive Regel:',
      noRuleMatchedBanner: 'Keine Regel zutreffend (Standard-Profil aktiv)',
      liveState: 'Live Status:',
      liveHrActive: 'Puls: Aktiv',
      liveHrInactive: 'Puls: Inaktiv',
      liveMediaPlaying: 'Musik: An',
      liveMediaStopped: 'Musik: Aus',
      liveAfkYes: 'AFK: Ja',
      liveAfkNo: 'AFK: Nein',
      addRuleBtn: '+ Neue Bedingung bauen',
      saveRuleBtn: 'Regel speichern',
      cancelBtn: 'Abbrechen',
      newRuleTitle: 'Neue Automatisierungs-Regel erstellen',
      editRuleTitle: 'Automatisierungs-Regel bearbeiten',
      ruleNameLabel: 'Name der Bedingung',
      ruleNamePlaceholder: 'z.B. Wenn Puls=false und Musik=true dann Profil 1',
      conditionHrLabel: 'Puls Bedingung',
      conditionMediaLabel: 'Musik Bedingung',
      conditionAfkLabel: 'AFK Bedingung',
      optTrue: 'Muss AN / Aktiv sein',
      optFalse: 'Muss AUS / Inaktiv sein',
      optAny: 'Egal / Nicht beachten',
      targetProfileLabel: 'Ziel-Profil, das aktiviert werden soll',
      rulesListTitle: 'Eingestellte Bedingungen (Reihenfolge von oben nach unten)',
      noRulesYet: 'Keine Regeln vorhanden.',
      ruleMatchedNow: 'Trifft aktuell zu & ist aktiv!',
      deleteTooltip: 'Regel löschen',
      editTooltip: 'Regel bearbeiten',
      moveUpTooltip: 'Nach oben',
      moveDownTooltip: 'Nach unten',
      resetDefaultRulesBtn: 'Standard-Regeln wiederherstellen',
      resetNotice: 'Regeln auf Standard zurückgesetzt!',
      savedNotice: 'Regeln gespeichert!',
    },
  },
};
