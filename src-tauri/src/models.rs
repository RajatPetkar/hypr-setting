use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardSnapshot {
    pub hypr_config_dir: String,
    pub current_theme: String,
    pub active_animation: String,
    pub wallpaper: String,
    pub monitors: Vec<MonitorConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Keybinding {
    pub id: String,
    pub source: String,
    pub line_index: isize,
    pub enabled: bool,
    pub modifiers: String,
    pub key: String,
    pub dispatcher: String,
    pub command: String,
    pub description: String,
    pub category: String,
    pub conflict: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppearanceSettings {
    pub gaps_in: String,
    pub gaps_out: String,
    pub border_size: String,
    pub active_border_color: String,
    pub inactive_border_color: String,
    pub blur: String,
    pub rounding: String,
    pub opacity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationPreset {
    pub name: String,
    pub path: String,
    pub active: bool,
    pub preview: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Wallpaper {
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartupApp {
    pub id: String,
    pub source: String,
    pub line_index: isize,
    pub enabled: bool,
    pub command: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowRule {
    pub id: String,
    pub source: String,
    pub line_index: isize,
    pub enabled: bool,
    pub kind: String,
    pub rule: String,
    pub selector: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorConfig {
    pub id: String,
    pub source: String,
    pub line_index: isize,
    pub enabled: bool,
    pub name: String,
    pub resolution: String,
    pub refresh_rate: String,
    pub position: String,
    pub scale: String,
    pub raw: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeInfo {
    pub gtk_themes: Vec<String>,
    pub icon_themes: Vec<String>,
    pub cursor_themes: Vec<String>,
    pub wallust_available: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub name: String,
    pub path: String,
    pub created_at: String,
}
