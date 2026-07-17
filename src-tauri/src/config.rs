use crate::backups::{backup_file, ensure_parent, hypr_dir};
use crate::hyprctl;
use crate::models::*;
use anyhow::{Context, Result};
use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};

const KEYBIND_FILES: [&str; 2] = ["configs/Keybinds.conf", "UserConfigs/UserKeybinds.conf"];
const STARTUP_FILES: [&str; 2] = ["configs/Startup_Apps.conf", "UserConfigs/Startup_Apps.conf"];
const RULE_FILES: [&str; 2] = ["configs/WindowRules.conf", "UserConfigs/WindowRules.conf"];
const APPEARANCE_FILES: [&str; 3] = [
    "configs/SystemSettings.conf",
    "UserConfigs/UserSettings.conf",
    "UserConfigs/UserDecorations.conf",
];

pub fn read_keybindings() -> Result<Vec<Keybinding>> {
    let mut bindings = Vec::new();
    for relative in KEYBIND_FILES {
        let path = hypr_dir().join(relative);
        for (index, line) in read_lines(&path)?.iter().enumerate() {
            if let Some(binding) = parse_keybinding(&path, index as isize, line) {
                bindings.push(binding);
            }
        }
    }
    mark_conflicts(&mut bindings);
    Ok(bindings)
}

pub fn save_keybinding(binding: Keybinding) -> Result<()> {
    let target = hypr_dir().join("UserConfigs/UserKeybinds.conf");
    let line = format_optional_comment(
        binding.enabled,
        &format!(
            "bind = {}, {}, {}, {}{}",
            binding.modifiers,
            binding.key,
            binding.dispatcher,
            binding.command,
            if binding.description.trim().is_empty() {
                String::new()
            } else {
                format!(" # {}", binding.description.trim())
            }
        ),
    );
    upsert_line(&target, &binding.source, binding.line_index, line)
}

pub fn read_appearance() -> Result<AppearanceSettings> {
    let mut settings = AppearanceSettings {
        gaps_in: "5".into(),
        gaps_out: "10".into(),
        border_size: "2".into(),
        active_border_color: "rgba(33ccffee)".into(),
        inactive_border_color: "rgba(595959aa)".into(),
        blur: "true".into(),
        rounding: "8".into(),
        opacity: "1".into(),
    };
    for relative in APPEARANCE_FILES {
        let path = hypr_dir().join(relative);
        for line in read_lines(&path)? {
            if let Some((key, value)) = parse_assignment(&line) {
                match normalize_appearance_key(&key).as_deref() {
                    Some("gaps_in") => settings.gaps_in = value,
                    Some("gaps_out") => settings.gaps_out = value,
                    Some("border_size") => settings.border_size = value,
                    Some("active_border_color") => settings.active_border_color = value,
                    Some("inactive_border_color") => settings.inactive_border_color = value,
                    Some("blur") => settings.blur = value,
                    Some("rounding") => settings.rounding = value,
                    Some("opacity") => settings.opacity = value,
                    _ => {}
                }
            }
        }
    }
    Ok(settings)
}

pub fn set_appearance_value(key: &str, value: &str) -> Result<()> {
    let hypr_key = appearance_hyprctl_key(key).context("unsupported appearance setting")?;
    let target = hypr_dir().join("UserConfigs/UserSettings.conf");
    set_assignment(&target, hypr_key, value)?;
    if key == "opacity" {
        let _ = hyprctl::keyword("decoration:inactive_opacity", value);
    }
    hyprctl::keyword(hypr_key, value)
}

pub fn read_startup_apps() -> Result<Vec<StartupApp>> {
    let mut apps = Vec::new();
    for relative in STARTUP_FILES {
        let path = hypr_dir().join(relative);
        for (index, line) in read_lines(&path)?.iter().enumerate() {
            if let Some(command) = parse_prefixed_line(line, "exec-once") {
                apps.push(StartupApp {
                    id: make_id(&path, index, line),
                    source: path.to_string_lossy().to_string(),
                    line_index: index as isize,
                    enabled: enabled(line),
                    command,
                });
            }
        }
    }
    Ok(apps)
}

pub fn save_startup_app(app: StartupApp) -> Result<()> {
    let target = hypr_dir().join("UserConfigs/Startup_Apps.conf");
    let line = format_optional_comment(app.enabled, &format!("exec-once = {}", app.command.trim()));
    upsert_line(&target, &app.source, app.line_index, line)
}

pub fn read_window_rules() -> Result<Vec<WindowRule>> {
    let mut rules = Vec::new();
    for relative in RULE_FILES {
        let path = hypr_dir().join(relative);
        for (index, line) in read_lines(&path)?.iter().enumerate() {
            if let Some(rule) = parse_window_rule(&path, index as isize, line) {
                rules.push(rule);
            }
        }
    }
    Ok(rules)
}

pub fn save_window_rule(rule: WindowRule) -> Result<()> {
    let target = hypr_dir().join("UserConfigs/WindowRules.conf");
    let line = format_optional_comment(rule.enabled, &format!("{} = {}, {}", rule.kind, rule.rule, rule.selector));
    upsert_line(&target, &rule.source, rule.line_index, line)?;
    let _ = hyprctl::reload();
    Ok(())
}

pub fn read_monitors() -> Result<Vec<MonitorConfig>> {
    let path = hypr_dir().join("monitors.conf");
    let mut monitors = Vec::new();
    for (index, line) in read_lines(&path)?.iter().enumerate() {
        if let Some(monitor) = parse_monitor(&path, index as isize, line) {
            monitors.push(monitor);
        }
    }
    Ok(monitors)
}

pub fn save_monitor(monitor: MonitorConfig) -> Result<()> {
    let target = hypr_dir().join("monitors.conf");
    let resolution = if monitor.refresh_rate.trim().is_empty() || monitor.resolution.contains('@') {
        monitor.resolution.trim().to_string()
    } else {
        format!("{}@{}", monitor.resolution.trim(), monitor.refresh_rate.trim())
    };
    let value = if monitor.enabled {
        format!("{}, {}, {}, {}", monitor.name.trim(), resolution, monitor.position.trim(), monitor.scale.trim())
    } else {
        format!("{}, disabled", monitor.name.trim())
    };
    let line = format!("monitor = {}", value);
    upsert_line(&target, &monitor.source, monitor.line_index, line)?;
    hyprctl::keyword("monitor", &value)
}

pub fn delete_line(source: &str, line_index: isize) -> Result<()> {
    anyhow::ensure!(line_index >= 0, "cannot delete unsaved line");
    let path = PathBuf::from(source);
    let mut lines = read_lines(&path)?;
    let index = line_index as usize;
    anyhow::ensure!(index < lines.len(), "line index out of bounds");
    backup_file(&path)?;
    lines.remove(index);
    write_lines(&path, &lines)
}

fn parse_keybinding(path: &Path, index: isize, line: &str) -> Option<Keybinding> {
    let trimmed = uncommented(line);
    if !trimmed.starts_with("bind") || !trimmed.contains('=') {
        return None;
    }
    let (_, rhs) = trimmed.split_once('=')?;
    let (body, description) = split_comment(rhs);
    let mut parts = body.splitn(4, ',').map(|part| part.trim().to_string());
    let modifiers = parts.next()?;
    let key = parts.next()?;
    let dispatcher = parts.next().unwrap_or_else(|| "exec".to_string());
    let command = parts.next().unwrap_or_default();
    Some(Keybinding {
        id: make_id(path, index as usize, line),
        source: path.to_string_lossy().to_string(),
        line_index: index,
        enabled: enabled(line),
        modifiers,
        key,
        dispatcher: dispatcher.clone(),
        category: infer_category(&command, &dispatcher),
        command,
        description,
        conflict: false,
    })
}

fn mark_conflicts(bindings: &mut [Keybinding]) {
    let mut counts: HashMap<String, usize> = HashMap::new();
    for binding in bindings.iter().filter(|binding| binding.enabled) {
        *counts.entry(format!("{}+{}", binding.modifiers, binding.key).to_lowercase()).or_insert(0) += 1;
    }
    for binding in bindings {
        binding.conflict = binding.enabled
            && counts
                .get(&format!("{}+{}", binding.modifiers, binding.key).to_lowercase())
                .copied()
                .unwrap_or(0)
                > 1;
    }
}

fn parse_window_rule(path: &Path, index: isize, line: &str) -> Option<WindowRule> {
    let trimmed = uncommented(line);
    if !(trimmed.starts_with("windowrule") || trimmed.starts_with("windowrulev2")) {
        return None;
    }
    let (kind, rhs) = trimmed.split_once('=')?;
    let mut parts = rhs.trim().splitn(2, ',').map(str::trim);
    let rule = parts.next()?.to_string();
    let selector = parts.next().unwrap_or_default().to_string();
    Some(WindowRule {
        id: make_id(path, index as usize, line),
        source: path.to_string_lossy().to_string(),
        line_index: index,
        enabled: enabled(line),
        kind: kind.trim().to_string(),
        rule,
        selector,
    })
}

fn parse_monitor(path: &Path, index: isize, line: &str) -> Option<MonitorConfig> {
    let trimmed = uncommented(line);
    if !trimmed.starts_with("monitor") {
        return None;
    }
    let (_, rhs) = trimmed.split_once('=')?;
    let parts: Vec<_> = rhs.split(',').map(|part| part.trim().to_string()).collect();
    if parts.is_empty() {
        return None;
    }
    let enabled_monitor = !parts.iter().any(|part| part.eq_ignore_ascii_case("disabled"));
    let mode = parts.get(1).cloned().unwrap_or_else(|| "preferred".into());
    let (resolution, refresh_rate) = mode
        .split_once('@')
        .map(|(resolution, refresh)| (resolution.to_string(), refresh.to_string()))
        .unwrap_or((mode, String::new()));
    Some(MonitorConfig {
        id: make_id(path, index as usize, line),
        source: path.to_string_lossy().to_string(),
        line_index: index,
        enabled: enabled(line) && enabled_monitor,
        name: parts.first().cloned().unwrap_or_default(),
        resolution,
        refresh_rate,
        position: parts.get(2).cloned().unwrap_or_else(|| "0x0".into()),
        scale: parts.get(3).cloned().unwrap_or_else(|| "1".into()),
        raw: line.to_string(),
    })
}

fn parse_prefixed_line(line: &str, prefix: &str) -> Option<String> {
    let trimmed = uncommented(line);
    if !trimmed.starts_with(prefix) {
        return None;
    }
    trimmed.split_once('=').map(|(_, value)| value.trim().to_string())
}

fn parse_assignment(line: &str) -> Option<(String, String)> {
    let trimmed = uncommented(line);
    let (key, value) = trimmed.split_once('=')?;
    Some((key.trim().to_string(), split_comment(value).0.trim().to_string()))
}

fn set_assignment(path: &Path, key: &str, value: &str) -> Result<()> {
    let mut lines = read_lines(path)?;
    let mut found = false;
    for line in &mut lines {
        if let Some((existing, _)) = parse_assignment(line) {
            if existing == key {
                *line = format!("{} = {}", key, value);
                found = true;
                break;
            }
        }
    }
    if !found {
        lines.push(format!("{} = {}", key, value));
    }
    backup_file(path)?;
    write_lines(path, &lines)
}

fn upsert_line(target: &Path, source: &str, line_index: isize, line: String) -> Result<()> {
    let source_path = PathBuf::from(source);
    let edit_path = if line_index >= 0 && source_path.exists() {
        source_path
    } else {
        target.to_path_buf()
    };
    let mut lines = read_lines(&edit_path)?;
    backup_file(&edit_path)?;
    if line_index >= 0 && (line_index as usize) < lines.len() {
        lines[line_index as usize] = line;
    } else {
        lines.push(line);
    }
    write_lines(&edit_path, &lines)
}

fn read_lines(path: &Path) -> Result<Vec<String>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    Ok(fs::read_to_string(path)
        .with_context(|| format!("reading {}", path.display()))?
        .lines()
        .map(str::to_string)
        .collect())
}

fn write_lines(path: &Path, lines: &[String]) -> Result<()> {
    ensure_parent(path)?;
    let mut content = lines.join("\n");
    content.push('\n');
    fs::write(path, content).with_context(|| format!("writing {}", path.display()))
}

fn enabled(line: &str) -> bool {
    !line.trim_start().starts_with('#')
}

fn uncommented(line: &str) -> &str {
    line.trim_start().trim_start_matches('#').trim_start()
}

fn split_comment(value: &str) -> (String, String) {
    value
        .split_once('#')
        .map(|(body, comment)| (body.trim().to_string(), comment.trim().to_string()))
        .unwrap_or((value.trim().to_string(), String::new()))
}

fn format_optional_comment(enabled: bool, line: &str) -> String {
    if enabled {
        line.to_string()
    } else {
        format!("# {}", line)
    }
}

fn make_id(path: &Path, index: usize, line: &str) -> String {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    index.hash(&mut hasher);
    line.hash(&mut hasher);
    format!("{}:{}:{:x}", path.display(), index, hasher.finish())
}

fn infer_category(command: &str, dispatcher: &str) -> String {
    let lower = format!("{} {}", command, dispatcher).to_lowercase();
    if lower.contains("terminal") || lower.contains("kitty") || lower.contains("foot") || lower.contains("alacritty") {
        "Terminal".into()
    } else if lower.contains("workspace") {
        "Workspaces".into()
    } else if lower.contains("volume") || lower.contains("brightness") || lower.contains("playerctl") {
        "Media".into()
    } else if lower.contains("grim") || lower.contains("screenshot") {
        "Screenshots".into()
    } else if lower.contains("hyprctl") {
        "Hyprland".into()
    } else {
        "General".into()
    }
}

fn normalize_appearance_key(key: &str) -> Option<String> {
    let key = key.trim();
    let bare = key.rsplit(':').next().unwrap_or(key);
    match bare {
        "gaps_in" => Some("gaps_in".into()),
        "gaps_out" => Some("gaps_out".into()),
        "border_size" => Some("border_size".into()),
        "col.active_border" | "active_border_color" => Some("active_border_color".into()),
        "col.inactive_border" | "inactive_border_color" => Some("inactive_border_color".into()),
        "enabled" if key.contains("blur") => Some("blur".into()),
        "blur" => Some("blur".into()),
        "rounding" => Some("rounding".into()),
        "active_opacity" | "opacity" => Some("opacity".into()),
        _ => None,
    }
}

fn appearance_hyprctl_key(key: &str) -> Option<&'static str> {
    match key {
        "gaps_in" => Some("general:gaps_in"),
        "gaps_out" => Some("general:gaps_out"),
        "border_size" => Some("general:border_size"),
        "active_border_color" => Some("general:col.active_border"),
        "inactive_border_color" => Some("general:col.inactive_border"),
        "blur" => Some("decoration:blur:enabled"),
        "rounding" => Some("decoration:rounding"),
        "opacity" => Some("decoration:active_opacity"),
        _ => None,
    }
}
