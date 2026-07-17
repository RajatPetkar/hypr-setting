use anyhow::{anyhow, Result};
use std::process::{Command, Stdio};

pub fn keyword(key: &str, value: &str) -> Result<()> {
    run_status("hyprctl", &["keyword", key, value])
}

pub fn reload() -> Result<()> {
    run_status("hyprctl", &["reload"])
}

pub fn execute_quick_action(action: &str) -> Result<()> {
    match action {
        "reload" => reload(),
        "terminal" => spawn_shell(
            "if [ -n \"$TERMINAL\" ]; then \"$TERMINAL\" & elif command -v kitty >/dev/null 2>&1; then kitty & elif command -v foot >/dev/null 2>&1; then foot & elif command -v alacritty >/dev/null 2>&1; then alacritty & elif command -v wezterm >/dev/null 2>&1; then wezterm & else echo 'no terminal available' >&2; fi >/dev/null 2>&1 &",
        ),
        "lock" => spawn_shell("(hyprlock || swaylock || loginctl lock-session) >/dev/null 2>&1 &"),
        "waybar" => spawn_shell("pkill waybar >/dev/null 2>&1; waybar >/dev/null 2>&1 &"),
        other => Err(anyhow!("unknown quick action: {other}")),
    }
}

pub fn spawn_shell(command: &str) -> Result<()> {
    Command::new("sh")
        .arg("-lc")
        .arg(command)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()?;
    Ok(())
}

pub fn run_status(program: &str, args: &[&str]) -> Result<()> {
    let output = Command::new(program).args(args).output()?;
    if output.status.success() {
        Ok(())
    } else {
        Err(anyhow!(
            "{} failed: {}",
            program,
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

pub fn command_available(program: &str) -> bool {
    Command::new("sh")
        .arg("-lc")
        .arg(format!("command -v {program} >/dev/null 2>&1"))
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}
