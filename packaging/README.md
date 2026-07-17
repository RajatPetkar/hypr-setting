# Linux Packaging

## Tauri Bundles

Build native Linux packages with:

```bash
npm run tauri:build
```

Configured bundle targets:

- AppImage
- deb
- rpm

Output:

```text
src-tauri/target/release/bundle/
```

## Arch PKGBUILD Example

```bash
pkgname=hypr-settings
pkgver=0.1.0
pkgrel=1
pkgdesc="Hyprland settings control center"
arch=('x86_64')
url="https://example.local/hypr-settings"
license=('MIT')
depends=('webkit2gtk-4.1' 'hyprland')
makedepends=('nodejs' 'npm' 'rust' 'cargo')
optdepends=('swww: wallpaper support' 'wallust: theme generation' 'waybar: quick restart action' 'hyprlock: lock action')
source=("$pkgname-$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
  cd "$srcdir/$pkgname-$pkgver"
  npm install
  npm run tauri:build
}

package() {
  cd "$srcdir/$pkgname-$pkgver"
  install -Dm755 "src-tauri/target/release/hypr-settings" "$pkgdir/usr/bin/hypr-settings"
}
```

## Desktop Entry

```ini
[Desktop Entry]
Type=Application
Name=Hypr Settings
Comment=Hyprland settings control center
Exec=hypr-settings
Icon=hypr-settings
Categories=Settings;DesktopSettings;
Terminal=false
```
