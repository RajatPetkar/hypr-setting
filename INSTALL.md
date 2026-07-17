# Hypr Settings — Installation Guide

## Quick Install

```bash
tar -xzf hypr-settings-*-linux-x86_64.tar.gz
cd hypr-settings-*-linux-x86_64
./install.sh
```

That's it! Launch from your app menu or run `hypr-settings` in a terminal.

## Requirements

| Package | Required | Why |
|---------|----------|-----|
| `webkit2gtk-4.1` | ✅ | App rendering engine |
| `hyprland` | ✅ | The WM this app configures |

### Optional (for full functionality)

```bash
# Arch Linux
sudo pacman -S --needed swww waybar hyprlock wallust gsettings-desktop-schemas
```

| Package | Feature |
|---------|---------|
| `swww` or `hyprpaper` | Wallpaper switching |
| `waybar` | Quick restart action |
| `hyprlock` | Lock screen action |
| `wallust` | Colorscheme generation |
| `gsettings` | GTK/icon/cursor theme switching |

## Uninstall

```bash
./install.sh --uninstall
```

## Verify

Check the SHA256 checksum:

```bash
sha256sum -c hypr-settings-*-linux-x86_64.tar.gz.sha256
```
