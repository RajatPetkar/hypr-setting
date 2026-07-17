use crate::models::BackupInfo;
use anyhow::{Context, Result};
use chrono::Local;
use std::fs;
use std::path::{Path, PathBuf};

pub fn hypr_dir() -> PathBuf {
    if let Ok(path) = std::env::var("HYPR_SETTINGS_CONFIG_DIR") {
        return PathBuf::from(path);
    }
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".config")
        .join("hypr")
}

pub fn backup_dir() -> PathBuf {
    hypr_dir().join("backups")
}

pub fn ensure_parent(path: &Path) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    Ok(())
}

pub fn backup_file(path: &Path) -> Result<()> {
    if !path.exists() {
        return Ok(());
    }
    let hypr = hypr_dir();
    let relative = path.strip_prefix(&hypr).unwrap_or(path);
    let destination = backup_dir()
        .join(Local::now().format("%Y%m%d-%H%M%S").to_string())
        .join(relative);
    ensure_parent(&destination)?;
    fs::copy(path, destination)?;
    Ok(())
}

pub fn backup_all() -> Result<PathBuf> {
    let destination = backup_dir().join(Local::now().format("%Y%m%d-%H%M%S").to_string());
    copy_dir_filtered(&hypr_dir(), &destination, true)?;
    Ok(destination)
}

pub fn list_backups() -> Result<Vec<BackupInfo>> {
    let root = backup_dir();
    fs::create_dir_all(&root)?;
    let mut backups = Vec::new();
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        if !entry.file_type()?.is_dir() {
            continue;
        }
        let metadata = entry.metadata()?;
        let created = metadata
            .modified()
            .ok()
            .map(|time| chrono::DateTime::<Local>::from(time).format("%Y-%m-%d %H:%M:%S").to_string())
            .unwrap_or_else(|| "unknown".to_string());
        backups.push(BackupInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            created_at: created,
        });
    }
    backups.sort_by(|a, b| b.name.cmp(&a.name));
    Ok(backups)
}

pub fn restore_backup(path: String) -> Result<()> {
    let source = PathBuf::from(path);
    anyhow::ensure!(source.is_dir(), "backup path is not a directory");
    backup_all()?;
    copy_dir_filtered(&source, &hypr_dir(), false)
}

pub fn export_config(destination: String) -> Result<()> {
    let destination = expand_tilde(destination);
    copy_dir_filtered(&hypr_dir(), &destination, true)
}

pub fn import_config(source: String) -> Result<()> {
    let source = expand_tilde(source);
    anyhow::ensure!(source.is_dir(), "import source is not a directory");
    backup_all()?;
    copy_dir_filtered(&source, &hypr_dir(), true)
}

pub fn expand_tilde(path: String) -> PathBuf {
    if path == "~" {
        return dirs::home_dir().unwrap_or_else(|| PathBuf::from(path));
    }
    if let Some(rest) = path.strip_prefix("~/") {
        return dirs::home_dir().unwrap_or_else(|| PathBuf::from(".")).join(rest);
    }
    PathBuf::from(path)
}

pub fn copy_dir_filtered(source: &Path, destination: &Path, skip_backups: bool) -> Result<()> {
    fs::create_dir_all(destination)?;
    for entry in walkdir::WalkDir::new(source) {
        let entry = entry?;
        let path = entry.path();
        let relative = path.strip_prefix(source)?;
        if relative.as_os_str().is_empty() {
            continue;
        }
        if skip_backups && relative.components().next().map(|c| c.as_os_str() == "backups").unwrap_or(false) {
            continue;
        }
        let target = destination.join(relative);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&target)?;
        } else {
            ensure_parent(&target)?;
            fs::copy(path, &target).with_context(|| format!("copying {} to {}", path.display(), target.display()))?;
        }
    }
    Ok(())
}
