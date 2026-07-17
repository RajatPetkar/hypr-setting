#!/bin/bash
# ──────────────────────────────────────────────────────────────
#  Hypr Settings — Professional Installer
#  Builds and installs the app as a standalone system application.
#  After running this once, launch from your app menu or terminal.
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

INSTALL_DIR="$HOME/.local/bin"
APPS_DIR="$HOME/.local/share/applications"
ICONS_DIR="$HOME/.local/share/icons/hicolor"
BUILD_DIR="src-tauri/target/release"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo
    echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     Hypr Settings — Installer        ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
    echo
}

print_header

# ── Parse arguments ────────────────────────────────────────────
SKIP_BUILD=false
UNINSTALL=false

for arg in "$@"; do
    case "$arg" in
        --skip-build) SKIP_BUILD=true ;;
        --uninstall)  UNINSTALL=true ;;
        --help|-h)
            echo "Usage: ./install.sh [OPTIONS]"
            echo
            echo "Options:"
            echo "  --skip-build   Skip the build step (use existing binary)"
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
    rm -f "$ICONS_DIR/32x32/apps/hypr-settings.png"
    rm -f "$ICONS_DIR/128x128/apps/hypr-settings.png"
    rm -f "$ICONS_DIR/256x256/apps/hypr-settings.png"
    rm -f "$ICONS_DIR/512x512/apps/hypr-settings.png"
    if command -v update-desktop-database &>/dev/null; then
        update-desktop-database "$APPS_DIR" 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ Hypr Settings uninstalled.${NC}"
    exit 0
fi

# ── Check prerequisites ───────────────────────────────────────
echo -e "${YELLOW}[0/4]${NC} Checking prerequisites..."

missing=()
command -v node  &>/dev/null || missing+=("nodejs")
command -v npm   &>/dev/null || missing+=("npm")
command -v cargo &>/dev/null || missing+=("rust/cargo")

if [[ ${#missing[@]} -gt 0 ]]; then
    echo -e "${RED}✗ Missing: ${missing[*]}${NC}"
    echo "  Please install them and try again."
    exit 1
fi
echo "  All prerequisites found."

# ── Step 1: Install npm dependencies ──────────────────────────
echo -e "${YELLOW}[1/4]${NC} Checking npm dependencies..."
if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules/.package-lock.json" ]]; then
    npm install --no-audit --no-fund 2>&1 | tail -1
else
    echo "  Dependencies up to date."
fi

# ── Step 2: Build ──────────────────────────────────────────────
if [[ "$SKIP_BUILD" == false ]]; then
    echo -e "${YELLOW}[2/4]${NC} Building release binary (this may take a few minutes on first run)..."
    # Build frontend
    npm run build 2>&1 | tail -3
    # Build Tauri binary only (skip bundling to avoid linuxdeploy issues)
    cd src-tauri
    cargo build --release 2>&1 | tail -5
    cd ..
    echo "  Build complete."
else
    echo -e "${YELLOW}[2/4]${NC} Skipping build (--skip-build)"
    if [[ ! -f "$BUILD_DIR/hypr-settings" ]]; then
        echo -e "${RED}✗ No build found at $BUILD_DIR/hypr-settings${NC}"
        echo "  Run without --skip-build first."
        exit 1
    fi
fi

# ── Step 3: Install binary ────────────────────────────────────
echo -e "${YELLOW}[3/4]${NC} Installing binary to $INSTALL_DIR..."
mkdir -p "$INSTALL_DIR"
cp "$BUILD_DIR/hypr-settings" "$INSTALL_DIR/hypr-settings"
chmod +x "$INSTALL_DIR/hypr-settings"

# ── Step 4: Install desktop entry & icons ──────────────────────
echo -e "${YELLOW}[4/4]${NC} Installing desktop entry & icons..."
mkdir -p "$APPS_DIR"

cat > "$APPS_DIR/hypr-settings.desktop" << EOF
[Desktop Entry]
Type=Application
Name=Hypr Settings
Comment=Hyprland settings control center
Exec=$INSTALL_DIR/hypr-settings
Icon=hypr-settings
Categories=Settings;DesktopSettings;
Terminal=false
StartupWMClass=Hypr Settings
Keywords=hyprland;settings;config;wayland;
EOF

# Install icons at multiple sizes
for size in 32x32 128x128 128x128@2x; do
    icon_file="src-tauri/icons/${size}.png"
    if [[ -f "$icon_file" ]]; then
        target_size="$size"
        [[ "$size" == "128x128@2x" ]] && target_size="256x256"
        mkdir -p "$ICONS_DIR/$target_size/apps"
        cp "$icon_file" "$ICONS_DIR/$target_size/apps/hypr-settings.png"
    fi
done

if [[ -f "src-tauri/icons/icon.png" ]]; then
    mkdir -p "$ICONS_DIR/512x512/apps"
    cp "src-tauri/icons/icon.png" "$ICONS_DIR/512x512/apps/hypr-settings.png"
fi

# Update caches
if command -v gtk-update-icon-cache &>/dev/null; then
    gtk-update-icon-cache -f -t "$ICONS_DIR" 2>/dev/null || true
fi
if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$APPS_DIR" 2>/dev/null || true
fi

echo
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Installation Complete!           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo
echo "  Launch methods:"
echo "    • App menu → search 'Hypr Settings'"
echo "    • Terminal → hypr-settings"
echo

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo -e "${YELLOW}⚠ Warning:${NC} ~/.local/bin is not in your PATH."
    echo "  Add this to your shell config (~/.bashrc or ~/.zshrc):"
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo
fi
