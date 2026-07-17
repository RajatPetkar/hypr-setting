#!/bin/bash
# ──────────────────────────────────────────────────────────────
#  Hypr Settings — Installer
#  Installs the pre-built binary, desktop entry, and icons.
#  Run this from the extracted release folder.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

INSTALL_DIR="$HOME/.local/bin"
APPS_DIR="$HOME/.local/share/applications"
ICONS_DIR="$HOME/.local/share/icons/hicolor"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ── Parse arguments ────────────────────────────────────────────
UNINSTALL=false
for arg in "$@"; do
    case "$arg" in
        --uninstall)  UNINSTALL=true ;;
        --help|-h)
            echo "Usage: ./install.sh [OPTIONS]"
            echo
            echo "Options:"
            echo "  --uninstall    Remove Hypr Settings from your system"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
    esac
done

# ── Uninstall ──────────────────────────────────────────────────
if [[ "$UNINSTALL" == true ]]; then
    echo -e "${YELLOW}Uninstalling Hypr Settings...${NC}"
    rm -f "$INSTALL_DIR/hypr-settings"
    rm -f "$APPS_DIR/hypr-settings.desktop"
    for size in 32x32 128x128 256x256 512x512; do
        rm -f "$ICONS_DIR/$size/apps/hypr-settings.png"
    done
    command -v update-desktop-database &>/dev/null && update-desktop-database "$APPS_DIR" 2>/dev/null || true
    echo -e "${GREEN}✓ Hypr Settings uninstalled.${NC}"
    exit 0
fi

# ── Check binary exists ───────────────────────────────────────
if [[ ! -f "hypr-settings" ]]; then
    echo -e "${RED}✗ Binary not found. Make sure you're running this from the extracted release folder.${NC}"
    exit 1
fi

echo
echo -e "${YELLOW}Installing Hypr Settings...${NC}"
echo

# ── Install binary ─────────────────────────────────────────────
echo "  [1/3] Installing binary to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
cp hypr-settings "$INSTALL_DIR/hypr-settings"
chmod +x "$INSTALL_DIR/hypr-settings"

# ── Install desktop entry ─────────────────────────────────────
echo "  [2/3] Installing desktop entry..."
mkdir -p "$APPS_DIR"
sed "s|Exec=hypr-settings|Exec=$INSTALL_DIR/hypr-settings|" hypr-settings.desktop > "$APPS_DIR/hypr-settings.desktop"

# ── Install icons ──────────────────────────────────────────────
echo "  [3/3] Installing icons..."
declare -A icon_map=(
    ["32x32.png"]="32x32"
    ["128x128.png"]="128x128"
    ["128x128@2x.png"]="256x256"
    ["icon.png"]="512x512"
)
for file in "${!icon_map[@]}"; do
    if [[ -f "icons/$file" ]]; then
        size="${icon_map[$file]}"
        mkdir -p "$ICONS_DIR/$size/apps"
        cp "icons/$file" "$ICONS_DIR/$size/apps/hypr-settings.png"
    fi
done

# Update caches
command -v gtk-update-icon-cache &>/dev/null && gtk-update-icon-cache -f -t "$ICONS_DIR" 2>/dev/null || true
command -v update-desktop-database &>/dev/null && update-desktop-database "$APPS_DIR" 2>/dev/null || true

echo
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Installation Complete!           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo
echo "  Launch:"
echo "    • App menu → search 'Hypr Settings'"
echo "    • Terminal → hypr-settings"
echo
echo "  Uninstall:"
echo "    • ./install.sh --uninstall"
echo

if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo -e "${YELLOW}⚠ Note:${NC} ~/.local/bin is not in your PATH."
    echo "  Add to your shell config:"
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo
fi
