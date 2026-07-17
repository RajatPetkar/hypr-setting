mod backups;
mod config;
mod hyprctl;
mod models;
mod services;
mod watcher;

use models::*;

#[tauri::command]
fn get_dashboard_snapshot() -> Result<DashboardSnapshot, String> {
    services::dashboard_snapshot().map_err(to_string)
}

#[tauri::command]
fn read_keybindings() -> Result<Vec<Keybinding>, String> {
    config::read_keybindings().map_err(to_string)
}

#[tauri::command]
fn save_keybinding(binding: Keybinding) -> Result<(), String> {
    config::save_keybinding(binding).map_err(to_string)
}

#[tauri::command]
fn delete_keybinding(binding: Keybinding) -> Result<(), String> {
    config::delete_line(&binding.source, binding.line_index).map_err(to_string)
}

#[tauri::command]
fn read_appearance() -> Result<AppearanceSettings, String> {
    config::read_appearance().map_err(to_string)
}

#[tauri::command]
fn set_appearance_value(key: String, value: String) -> Result<(), String> {
    config::set_appearance_value(&key, &value).map_err(to_string)
}

#[tauri::command]
fn list_animations() -> Result<Vec<AnimationPreset>, String> {
    services::list_animations().map_err(to_string)
}

#[tauri::command]
fn switch_animation(path: String) -> Result<(), String> {
    services::switch_animation(path).map_err(to_string)
}

#[tauri::command]
fn list_wallpapers() -> Result<Vec<Wallpaper>, String> {
    services::list_wallpapers().map_err(to_string)
}

#[tauri::command]
fn set_wallpaper(path: String) -> Result<(), String> {
    services::set_wallpaper(path).map_err(to_string)
}

#[tauri::command]
fn random_wallpaper() -> Result<(), String> {
    services::random_wallpaper().map_err(to_string)
}

#[tauri::command]
fn read_startup_apps() -> Result<Vec<StartupApp>, String> {
    config::read_startup_apps().map_err(to_string)
}

#[tauri::command]
fn save_startup_app(app: StartupApp) -> Result<(), String> {
    config::save_startup_app(app).map_err(to_string)
}

#[tauri::command]
fn delete_startup_app(app: StartupApp) -> Result<(), String> {
    config::delete_line(&app.source, app.line_index).map_err(to_string)
}

#[tauri::command]
fn read_window_rules() -> Result<Vec<WindowRule>, String> {
    config::read_window_rules().map_err(to_string)
}

#[tauri::command]
fn save_window_rule(rule: WindowRule) -> Result<(), String> {
    config::save_window_rule(rule).map_err(to_string)
}

#[tauri::command]
fn delete_window_rule(rule: WindowRule) -> Result<(), String> {
    config::delete_line(&rule.source, rule.line_index).map_err(to_string)
}

#[tauri::command]
fn read_monitors() -> Result<Vec<MonitorConfig>, String> {
    config::read_monitors().map_err(to_string)
}

#[tauri::command]
fn save_monitor(monitor: MonitorConfig) -> Result<(), String> {
    config::save_monitor(monitor).map_err(to_string)
}

#[tauri::command]
fn get_theme_info() -> Result<ThemeInfo, String> {
    services::theme_info().map_err(to_string)
}

#[tauri::command]
fn apply_theme(kind: String, name: String) -> Result<(), String> {
    services::apply_theme(&kind, &name).map_err(to_string)
}

#[tauri::command]
fn list_backups() -> Result<Vec<BackupInfo>, String> {
    backups::list_backups().map_err(to_string)
}

#[tauri::command]
fn restore_backup(path: String) -> Result<(), String> {
    backups::restore_backup(path).map_err(to_string)
}

#[tauri::command]
fn export_config(destination: String) -> Result<(), String> {
    backups::export_config(destination).map_err(to_string)
}

#[tauri::command]
fn import_config(source: String) -> Result<(), String> {
    backups::import_config(source).map_err(to_string)
}

#[tauri::command]
fn execute_quick_action(action: String) -> Result<(), String> {
    hyprctl::execute_quick_action(&action).map_err(to_string)
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    let safe = url.replace('"', "\\\"");
    hyprctl::spawn_shell(&format!("xdg-open \"{}\" >/dev/null 2>&1 &", safe)).map_err(to_string)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            watcher::start(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_dashboard_snapshot,
            read_keybindings,
            save_keybinding,
            delete_keybinding,
            read_appearance,
            set_appearance_value,
            list_animations,
            switch_animation,
            list_wallpapers,
            set_wallpaper,
            random_wallpaper,
            read_startup_apps,
            save_startup_app,
            delete_startup_app,
            read_window_rules,
            save_window_rule,
            delete_window_rule,
            read_monitors,
            save_monitor,
            get_theme_info,
            apply_theme,
            list_backups,
            restore_backup,
            export_config,
            import_config,
            execute_quick_action,
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running Hypr Settings");
}

fn to_string(error: anyhow::Error) -> String {
    error.to_string()
}
