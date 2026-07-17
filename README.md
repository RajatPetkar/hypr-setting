<p align="center">
  <img src="src-tauri/icons/icon.png" width="128" height="128" alt="Hypr Settings">
</p>

<h1 align="center">Hypr Settings</h1>

<p align="center">
  <strong>A desktop control center for Hyprland</strong>
  <br>
  Manage keybindings, appearance, wallpapers, animations, startup apps, window rules, monitors, themes, and backups — all from a beautiful GUI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Linux-blue?style=flat-square" alt="Linux">
  <img src="https://img.shields.io/badge/WM-Hyprland-cyan?style=flat-square" alt="Hyprland">
  <img src="https://img.shields.io/badge/Built_with-Tauri_2-orange?style=flat-square" alt="Tauri 2">
  <img src="https://img.shields.io/github/v/release/rajatpetkar/hypr-settings?style=flat-square&color=green" alt="Release">
  <img src="https://img.shields.io/github/license/rajatpetkar/hypr-settings?style=flat-square" alt="License">
</p>

---

## Install

### One-liner

```bash
curl -fsSL https://github.com/rajatpetkar/hypr-settings/releases/latest/download/hypr-settings-0.1.0-linux-x86_64.tar.gz | tar -xz && cd hypr-settings-*-linux-x86_64 && ./install.sh
```

### Manual download

1. Go to [**Releases**](https://github.com/rajatpetkar/hypr-settings/releases/latest)
2. Download `hypr-settings-<version>-linux-x86_64.tar.gz`
3. Extract and install:

```bash
tar -xzf hypr-settings-*-linux-x86_64.tar.gz
cd hypr-settings-*-linux-x86_64
./install.sh
```

4. Launch from your app menu or run `hypr-settings`

### Arch Linux (AUR)

```bash
# Coming soon — or build from source:
git clone https://github.com/rajatpetkar/hypr-settings.git
cd hypr-settings
npm install
bash install.sh
```

### Uninstall

```bash
./install.sh --uninstall
```

---

## Features

| Feature | Description |
|---------|-------------|
| 🖥️ **Dashboard** | System overview with theme, animation, wallpaper, monitors, and quick actions |
| ⌨️ **Keybindings** | Search, edit, create, delete — with conflict detection |
| 🎨 **Appearance** | Gaps, borders, colors, blur, rounding, opacity — applied live |
| 💫 **Animations** | Browse and switch animation presets |
| 🖼️ **Wallpapers** | Browse `~/Pictures/Wallpapers` and `~/.config/hypr/wallpapers` |
| 🚀 **Startup Apps** | Manage `exec-once` entries |
| 📐 **Window Rules** | Edit `windowrule` and `windowrulev2` entries |
| 🖥️ **Monitors** | Configure resolution, position, scale from `monitors.conf` |
| 🎭 **Themes** | Switch GTK, icon, and cursor themes; run Wallust |
| 💾 **Backups** | Auto-backup before every write; restore, export, import configs |
| 🔍 **Global Search** | Jump to any settings page instantly |
| 🔄 **Live Reload** | File watcher refreshes UI when configs change externally |
| 🌙 **Dark Mode** | Toggle dark/light mode |

---

## Supported Config Layout

```text
~/.config/hypr/
├── animations/          # Animation presets
├── configs/             # System config files
│   ├── Keybinds.conf
│   ├── Startup_Apps.conf
│   ├── SystemSettings.conf
│   └── WindowRules.conf
├── UserConfigs/         # Your personal overrides
│   ├── UserSettings.conf
│   ├── UserAnimations.conf
│   ├── UserKeybinds.conf
│   ├── Startup_Apps.conf
│   └── WindowRules.conf
├── monitors.conf
└── hyprland.conf
```

> **Note:** Hypr Settings writes only to `UserConfigs/` and `monitors.conf`. System configs under `configs/` are read-only.

---

## Requirements

| Package | Required |
|---------|----------|
| `hyprland` | ✅ |
| `webkit2gtk-4.1` | ✅ |

### Optional runtime tools

```bash
sudo pacman -S --needed swww waybar hyprlock wallust gsettings-desktop-schemas
```

| Tool | Feature |
|------|---------|
| `swww` / `hyprpaper` | Wallpaper switching |
| `waybar` | Quick restart action |
| `hyprlock` | Lock screen action |
| `wallust` | Colorscheme generation |
| `gsettings` | GTK/icon/cursor theme switching |

---

## Build from Source

```bash
# Prerequisites (Arch Linux)
sudo pacman -S --needed nodejs npm rust webkit2gtk-4.1 base-devel

# Clone and build
git clone https://github.com/rajatpetkar/hypr-settings.git
cd hypr-settings
npm install
bash install.sh          # Build + install
```

After changes:
```bash
bash install.sh          # Rebuild + reinstall
bash install.sh --skip-build  # Reinstall without rebuilding
```

---

## Safety

Every config write creates a timestamped backup under:

```text
~/.config/hypr/backups/YYYYMMDD-HHMMSS/
```

Use the Backups page to restore, export, or import configurations.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

[MIT](LICENSE)

## Developer

**Rajat Petkar** — [GitHub](https://github.com/rajatpetkar) · [Email](mailto:rajatpetkar250@gmail.com)
