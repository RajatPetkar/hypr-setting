use crate::backups::{backup_file, ensure_parent, expand_tilde, hypr_dir};
use crate::config;
use crate::hyprctl;
use crate::models::*;
use anyhow::{anyhow, Context, Result};
use std::fs;
use std::process::Command;
use std::path::{Path, PathBuf};

pub fn dashboard_snapshot() -> Result<DashboardSnapshot> {
    Ok(DashboardSnapshot {
        hypr_config_dir: hypr_dir().to_string_lossy().to_string(),
        current_theme: std::env::var("GTK_THEME")
            .ok()
            .filter(|value| !value.is_empty())
            .or_else(read_gtk_theme)
            .unwrap_or_else(|| "Unknown".into()),
        active_animation: active_animation_name()?,
        wallpaper: current_wallpaper(),
        monitors: config::read_monitors()?,
    })
}

pub fn list_animations() -> Result<Vec<AnimationPreset>> {
    let root = hypr_dir().join("animations");
    let active = fs::read_to_string(hypr_dir().join("UserConfigs/UserAnimations.conf")).unwrap_or_default();
    let mut presets = Vec::new();
    if !root.exists() {
        return Ok(presets);
    }
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|ext| ext.to_str()) != Some("conf") {
            continue;
        }
        let content = fs::read_to_string(&path).unwrap_or_default();
        let preview = content
            .lines()
            .filter(|line| {
                let trimmed = line.trim();
                !trimmed.is_empty() && !trimmed.starts_with('#')
            })
            .take(4)
            .map(str::to_string)
            .collect::<Vec<_>>();
        presets.push(AnimationPreset {
            name: path.file_stem().unwrap_or_default().to_string_lossy().to_string(),
            path: path.to_string_lossy().to_string(),
            active: !content.is_empty() && active == content,
            preview,
        });
    }
    presets.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(presets)
}

pub fn switch_animation(path: String) -> Result<()> {
    let source = expand_tilde(path);
    anyhow::ensure!(source.exists(), "animation preset does not exist");
    let target = hypr_dir().join("UserConfigs/UserAnimations.conf");
    backup_file(&target)?;
    ensure_parent(&target)?;
    fs::copy(source, target)?;
    hyprctl::reload()
}

pub fn list_wallpapers() -> Result<Vec<Wallpaper>> {
    let mut wallpapers = Vec::new();
    let mut dirs = vec![hypr_dir().join("wallpapers")];
    if let Some(home) = dirs::home_dir() {
        dirs.push(home.join("Pictures/Wallpapers"));
        dirs.push(home.join("Pictures/wallpapers"));
    }
    for dir in dirs {
        if !dir.exists() {
            continue;
        }
        for entry in walkdir::WalkDir::new(dir) {
            let entry = entry?;
            if !entry.file_type().is_file() {
                continue;
            }
            let path = entry.path();
            if !is_image(path) {
                continue;
            }
            wallpapers.push(Wallpaper {
                name: path.file_name().unwrap_or_default().to_string_lossy().to_string(),
                path: path.to_string_lossy().to_string(),
            });
        }
    }
    wallpapers.sort_by(|a, b| a.name.cmp(&b.name));
    wallpapers.dedup_by(|a, b| a.path == b.path);
    Ok(wallpapers)
}

pub fn set_wallpaper(path: String) -> Result<()> {
    let path = expand_tilde(path).to_string_lossy().to_string();
    if let Ok(custom_command) = std::env::var("HYPR_SETTINGS_WALLPAPER_COMMAND") {
        let command = custom_command.replace("{path}", &shell_escape(&path));
        hyprctl::spawn_shell(&command)?;
        write_current_wallpaper(&path)?;
        return Ok(());
    }

    // Prefer 'awww' if available, then fall back to 'swww', then hyprpaper
    if awww_daemon_running() {
        hyprctl::run_status("awww", &["img", &path])?;
    } else if hyprctl::command_available("awww") {
        start_awww_daemon()?;
        let mut last_err: Option<anyhow::Error> = None;
        for attempt in 0..5 {
            std::thread::sleep(std::time::Duration::from_millis(150 * (attempt + 1) as u64));
            match hyprctl::run_status("awww", &["img", &path]) {
                Ok(_) => { last_err = None; break; }
                Err(e) => { last_err = Some(e.context(format!("attempt {} failed", attempt + 1))); }
            }
        }
        if let Some(e) = last_err {
            return Err(anyhow!("failed to set wallpaper via awww: {}", e));
        }
    } else if swww_daemon_running() {
        hyprctl::run_status("swww", &["img", &path])?;
    } else if hyprctl::command_available("swww") {
        start_swww_daemon()?;
        let mut last_err: Option<anyhow::Error> = None;
        for attempt in 0..5 {
            std::thread::sleep(std::time::Duration::from_millis(150 * (attempt + 1) as u64));
            match hyprctl::run_status("swww", &["img", &path]) {
                Ok(_) => { last_err = None; break; }
                Err(e) => { last_err = Some(e.context(format!("attempt {} failed", attempt + 1))); }
            }
        }
        if let Some(e) = last_err {
            return Err(anyhow!("failed to set wallpaper via swww: {}", e));
        }
    } else if hyprpaper_running() {
        let _ = hyprctl::run_status("hyprctl", &["hyprpaper", "unload", "all"]);
        let _ = hyprctl::run_status("hyprctl", &["hyprpaper", "preload", &path]);
        hyprctl::run_status("hyprctl", &["hyprpaper", "wallpaper", &format!(",{}", path)])?;
    } else if hyprctl::command_available("hyprctl") {
        return Err(anyhow!("swww is not available and hyprpaper is not running; start swww or install hyprpaper, or set HYPR_SETTINGS_WALLPAPER_COMMAND"));
    } else {
        return Err(anyhow!("no wallpaper backend is available; install swww or hyprpaper, or set HYPR_SETTINGS_WALLPAPER_COMMAND"));
    }
    write_current_wallpaper(&path)?;
    Ok(())
}

pub fn random_wallpaper() -> Result<()> {
    let wallpapers = list_wallpapers()?;
    anyhow::ensure!(!wallpapers.is_empty(), "no wallpapers found");
    let index = chrono::Local::now().timestamp() as usize % wallpapers.len();
    set_wallpaper(wallpapers[index].path.clone())
}

pub fn theme_info() -> Result<ThemeInfo> {
    Ok(ThemeInfo {
        gtk_themes: list_theme_dirs(&["/usr/share/themes", "~/.themes", "~/.local/share/themes"]),
        icon_themes: list_theme_dirs(&["/usr/share/icons", "~/.icons", "~/.local/share/icons"]),
        cursor_themes: list_theme_dirs(&["/usr/share/icons", "~/.icons", "~/.local/share/icons"]),
        wallust_available: hyprctl::command_available("wallust"),
    })
}

pub fn apply_theme(kind: &str, name: &str) -> Result<()> {
    match kind {
        "gtk" => hyprctl::spawn_shell(&format!(
            "gsettings set org.gnome.desktop.interface gtk-theme '{}'",
            shell_escape(name)
        )),
        "icons" => hyprctl::spawn_shell(&format!(
            "gsettings set org.gnome.desktop.interface icon-theme '{}'",
            shell_escape(name)
        )),
        "cursor" => hyprctl::spawn_shell(&format!(
            "gsettings set org.gnome.desktop.interface cursor-theme '{}'",
            shell_escape(name)
        )),
        "wallust" => {
            let wallpaper = current_wallpaper();
            anyhow::ensure!(!wallpaper.is_empty(), "no current wallpaper known");
            hyprctl::spawn_shell(&format!("wallust run '{}'", shell_escape(&wallpaper)))
        }
        other => Err(anyhow!("unsupported theme kind: {other}")),
    }
}

fn active_animation_name() -> Result<String> {
    let active_path = hypr_dir().join("UserConfigs/UserAnimations.conf");
    let active = fs::read_to_string(active_path).unwrap_or_default();
    for preset in list_animations().unwrap_or_default() {
        let content = fs::read_to_string(&preset.path).unwrap_or_default();
        if !active.is_empty() && active == content {
            return Ok(preset.name);
        }
    }
    Ok("Default".into())
}

fn current_wallpaper() -> String {
    if let Some(wallpaper) = query_awww_wallpaper() {
        return wallpaper;
    }
    if let Some(wallpaper) = query_swww_wallpaper() {
        return wallpaper;
    }
    if let Some(wallpaper) = query_hyprpaper_wallpaper() {
        return wallpaper;
    }
    let cache = wallpaper_cache_path();
    fs::read_to_string(cache).unwrap_or_default().trim().to_string()
}

fn write_current_wallpaper(path: &str) -> Result<()> {
    let cache = wallpaper_cache_path();
    ensure_parent(&cache)?;
    fs::write(cache, path).context("writing wallpaper cache")
}

fn wallpaper_cache_path() -> PathBuf {
    dirs::cache_dir()
        .or_else(|| dirs::home_dir().map(|home| home.join(".cache")))
        .unwrap_or_else(|| PathBuf::from("."))
        .join("hypr-settings/current-wallpaper")
}

fn query_swww_wallpaper() -> Option<String> {
    if !swww_daemon_running() && !hyprctl::command_available("swww") {
        return None;
    }
    let output = Command::new("sh")
        .arg("-lc")
        .arg("swww query 2>/dev/null")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    extract_wallpaper_path(&String::from_utf8_lossy(&output.stdout))
}

fn query_awww_wallpaper() -> Option<String> {
    if !awww_daemon_running() && !hyprctl::command_available("awww") {
        return None;
    }
    let output = Command::new("sh")
        .arg("-lc")
        .arg("awww query 2>/dev/null")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    extract_wallpaper_path(&String::from_utf8_lossy(&output.stdout))
}

fn query_hyprpaper_wallpaper() -> Option<String> {
    if !hyprpaper_running() && !hyprctl::command_available("hyprctl") {
        return None;
    }
    let output = Command::new("sh")
        .arg("-lc")
        .arg("hyprctl hyprpaper listactive 2>/dev/null")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    extract_wallpaper_path(&String::from_utf8_lossy(&output.stdout))
}

fn extract_wallpaper_path(output: &str) -> Option<String> {
    for line in output.lines() {
        if let Some(candidate) = quoted_value(line, '"')
            .or_else(|| quoted_value(line, '\''))
            .filter(|candidate| is_wallpaper_candidate(candidate))
        {
            return Some(candidate);
        }

        for token in line.split_whitespace() {
            let candidate = token.trim_matches(|ch: char| matches!(ch, ',' | ':' | ';' | '[' | ']' | '(' | ')'));
            if is_wallpaper_candidate(candidate) {
                return Some(candidate.to_string());
            }
        }
    }
    None
}

fn quoted_value(line: &str, quote: char) -> Option<String> {
    let start = line.find(quote)?;
    let rest = &line[start + quote.len_utf8()..];
    let end = rest.find(quote)?;
    let value = rest[..end].trim();
    (!value.is_empty()).then(|| value.to_string())
}

fn is_wallpaper_candidate(value: &str) -> bool {
    let path = Path::new(value);
    is_image(path) || value.starts_with('/') || value.starts_with("~/")
}

fn swww_daemon_running() -> bool {
    Command::new("sh")
        .arg("-lc")
        .arg("pgrep -x swww-daemon >/dev/null 2>&1")
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

fn start_swww_daemon() -> Result<()> {
    hyprctl::spawn_shell("swww init >/dev/null 2>&1 || true")
}

fn awww_daemon_running() -> bool {
    Command::new("sh")
        .arg("-lc")
        .arg("pgrep -x awww-daemon >/dev/null 2>&1")
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

fn start_awww_daemon() -> Result<()> {
    hyprctl::spawn_shell("awww init >/dev/null 2>&1 || true")
}

fn hyprpaper_running() -> bool {
    Command::new("sh")
        .arg("-lc")
        .arg("pgrep -x hyprpaper >/dev/null 2>&1")
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

fn read_gtk_theme() -> Option<String> {
    let output = std::process::Command::new("sh")
        .arg("-lc")
        .arg("gsettings get org.gnome.desktop.interface gtk-theme 2>/dev/null")
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    Some(String::from_utf8_lossy(&output.stdout).trim().trim_matches('\'').to_string())
}

fn list_theme_dirs(dirs: &[&str]) -> Vec<String> {
    let mut values = Vec::new();
    for dir in dirs {
        let path = expand_tilde((*dir).to_string());
        if !path.exists() {
            continue;
        }
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                if entry.file_type().map(|kind| kind.is_dir()).unwrap_or(false) {
                    values.push(entry.file_name().to_string_lossy().to_string());
                }
            }
        }
    }
    values.sort();
    values.dedup();
    values
}

fn is_image(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|ext| ext.to_str()).map(str::to_lowercase).as_deref(),
        Some("png" | "jpg" | "jpeg" | "webp")
    )
}

fn shell_escape(value: &str) -> String {
    value.replace('\'', "'\\''")
}
