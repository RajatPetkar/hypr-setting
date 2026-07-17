export type PageId =
  | "dashboard"
  | "keybindings"
  | "appearance"
  | "animations"
  | "wallpapers"
  | "startup"
  | "window-rules"
  | "monitors"
  | "themes"
  | "backups"
  | "developer";

export type DashboardSnapshot = {
  hypr_config_dir: string;
  current_theme: string;
  active_animation: string;
  wallpaper: string;
  monitors: MonitorConfig[];
};

export type Keybinding = {
  id: string;
  source: string;
  line_index: number;
  enabled: boolean;
  modifiers: string;
  key: string;
  dispatcher: string;
  command: string;
  description: string;
  category: string;
  conflict: boolean;
};

export type AppearanceSettings = {
  gaps_in: string;
  gaps_out: string;
  border_size: string;
  active_border_color: string;
  inactive_border_color: string;
  blur: string;
  rounding: string;
  opacity: string;
};

export type AnimationPreset = {
  name: string;
  path: string;
  active: boolean;
  preview: string[];
};

export type Wallpaper = {
  name: string;
  path: string;
};

export type StartupApp = {
  id: string;
  source: string;
  line_index: number;
  enabled: boolean;
  command: string;
};

export type WindowRule = {
  id: string;
  source: string;
  line_index: number;
  enabled: boolean;
  kind: string;
  rule: string;
  selector: string;
};

export type MonitorConfig = {
  id: string;
  source: string;
  line_index: number;
  enabled: boolean;
  name: string;
  resolution: string;
  refresh_rate: string;
  position: string;
  scale: string;
  raw: string;
};

export type ThemeInfo = {
  gtk_themes: string[];
  icon_themes: string[];
  cursor_themes: string[];
  wallust_available: boolean;
};

export type BackupInfo = {
  name: string;
  path: string;
  created_at: string;
};
