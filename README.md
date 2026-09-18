# 🎮 VRChat OSC Chatbox Hub (Windows Edition)

A lightweight, secure, and resource-efficient OSC Chatbox Manager for **VRChat on Windows (10 & 11)**.
Supports live heart rate monitoring (HypeRate & Pulsoid), automatic Windows Spotify desktop playback detection, rotating custom status texts, Windows hardware performance monitoring (CPU, RAM, GPU), and automated AFK tracking with VRChat ingress synchronization.

Includes a built-in multilingual interface (**English** and **Deutsch**) switchable directly in the web app.

---

## ✨ Key Features

- **💓 Heart Rate Tracking (HypeRate & Pulsoid):**
  - Built-in Pelikan relay: Connect instantly without needing a client-side API token!
  - Supports HypeRate session IDs (Apple Watch, WearOS, Garmin) and Pulsoid tokens.
  - Web Bluetooth LE support for direct chest strap pairing (Polar H10, Garmin HRM, CooSpo, etc.).
  - Dynamic pulse animations, heart rate zones, and customizable display formats.
- **🎵 Spotify & Windows Media Detection:**
  - Automatic detection of the official Spotify Desktop app on Windows (Title & Artist).
  - Optional PowerShell watcher script (`windows-media-watcher.ps1`) for sub-second updates.
  - Detects Play / Pause / Stopped playback states reliably.
- **💬 Rotating Custom Status Texts:**
  - Configure multiple status messages that cycle automatically in VRChat at your desired interval (`{freitext}`).
- **💤 Automated AFK Inactivity Detection:**
  - Receives VRChat headset and menu state via UDP port 9001 (`/avatar/parameters/AFK`).
  - Inactivity timer: Automatically detects movement and controller/keyboard input and turns off AFK mode immediately upon moving.
- **💻 Windows Hardware Monitoring:**
  - Real-time CPU utilization, RAM usage (GB / %), and GPU load (Nvidia) directly inside your avatar chatbox.
- **🎛️ Profile Management:**
  - Preset profiles (e.g., "Music Only (No Heart Rate)", "Minimal", "Standard", "Full HUD") plus custom profile saving and loading.
- **👀 Real-Time Live Chatbox Preview:**
  - Pixel-perfect simulation of the VRChat Chatbox, including character count warning (144 characters limit) and marquee text scrolling for long titles.
- **🌐 In-App Language Switcher:**
  - Instant toggle between **English** and **German** in the top navigation bar.

---

## 🚀 Quick Start on Windows

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS version 18, 20, or 22 recommended)
- VRChat: Enable OSC in game (*Options* ➔ *OSC* ➔ *Enabled*)

### 2. Double-Click Launch (Recommended)
Simply double-click:
```cmd
start-windows.bat
```
The script automatically verifies Node.js, installs dependencies with `--legacy-peer-deps`, compiles the build, launches the server, and opens `http://localhost:3000` in your default browser.

If you want an instant start without compiling a build first, you can also run:
```cmd
start-windows-dev.bat
```

### 3. Manual Start (Command Prompt / PowerShell)
```powershell
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build the server
npm run build

# 3. Start the application
npm start
```
Then navigate to `http://localhost:3000` in your web browser.

---

## ⚙️ VRChat OSC Configuration (Windows)

1. Launch VRChat on your PC (Desktop mode or SteamVR).
2. Open the **Action Wheel** / Quick Menu (press `R` on keyboard or use the VR radial menu).
3. Navigate to **Options** ➔ **OSC** and set **OSC Enabled** to **ON**.
4. VRChat communication ports:
   - **Chatbox Input:** `127.0.0.1:9000` (UDP)
   - **Avatar Parameters & AFK Ingress:** `127.0.0.1:9001` (UDP)

---

## 🕒 Windows Autostart Setup

To make the hub start automatically whenever you boot your Windows PC:
1. Press `Win + R` on your keyboard.
2. Enter `shell:startup` and press Enter.
3. In the opened Startup folder, create a shortcut pointing to `start-windows.bat`.

---

## 🔒 Privacy & Security
- **No Key Leaks:** Your HypeRate session ID is private and automatically excluded from configuration export downloads.
- **Server Relay Protection:** Upstream HypeRate API connections are managed securely server-side.

---

## 📄 License
MIT License. Crafted with care for the VRChat community.
