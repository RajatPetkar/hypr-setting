import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";
import { command } from "@/lib/tauri";
import type {
  AnimationPreset,
  AppearanceSettings,
  BackupInfo,
  DashboardSnapshot,
  Keybinding,
  MonitorConfig,
  PageId,
  StartupApp,
  ThemeInfo,
  Wallpaper,
  WindowRule,
} from "@/types/hypr";

type Toast = {
  title: string;
  detail?: string;
  tone?: "default" | "error";
};

type SettingsState = {
  page: PageId;
  loading: boolean;
  error: string | null;
  toast: Toast | null;
  dashboard: DashboardSnapshot | null;
  keybindings: Keybinding[];
  appearance: AppearanceSettings | null;
  animations: AnimationPreset[];
  wallpapers: Wallpaper[];
  startupApps: StartupApp[];
  windowRules: WindowRule[];
  monitors: MonitorConfig[];
  themes: ThemeInfo | null;
  backups: BackupInfo[];
  setPage: (page: PageId) => void;
  clearToast: () => void;
  notify: (toast: Toast) => void;
  loadAll: () => Promise<void>;
  refreshPage: () => Promise<void>;
  runQuickAction: (action: string) => Promise<void>;
  saveKeybinding: (binding: Keybinding) => Promise<void>;
  deleteKeybinding: (binding: Keybinding) => Promise<void>;
  updateAppearance: (key: keyof AppearanceSettings, value: string) => Promise<void>;
  switchAnimation: (path: string) => Promise<void>;
  setWallpaper: (path: string) => Promise<void>;
  randomWallpaper: () => Promise<void>;
  saveStartupApp: (app: StartupApp) => Promise<void>;
  deleteStartupApp: (app: StartupApp) => Promise<void>;
  saveWindowRule: (rule: WindowRule) => Promise<void>;
  deleteWindowRule: (rule: WindowRule) => Promise<void>;
  saveMonitor: (monitor: MonitorConfig) => Promise<void>;
  applyTheme: (kind: string, name: string) => Promise<void>;
  restoreBackup: (path: string) => Promise<void>;
  exportConfig: (destination: string) => Promise<void>;
  importConfig: (source: string) => Promise<void>;
};

async function runLoaders(set: (partial: Partial<SettingsState>) => void) {
  const [
    dashboard,
    keybindings,
    appearance,
    animations,
    wallpapers,
    startupApps,
    windowRules,
    monitors,
    themes,
    backups,
  ] = await Promise.all([
    command<DashboardSnapshot>("get_dashboard_snapshot"),
    command<Keybinding[]>("read_keybindings"),
    command<AppearanceSettings>("read_appearance"),
    command<AnimationPreset[]>("list_animations"),
    command<Wallpaper[]>("list_wallpapers"),
    command<StartupApp[]>("read_startup_apps"),
    command<WindowRule[]>("read_window_rules"),
    command<MonitorConfig[]>("read_monitors"),
    command<ThemeInfo>("get_theme_info"),
    command<BackupInfo[]>("list_backups"),
  ]);
  set({ dashboard, keybindings, appearance, animations, wallpapers, startupApps, windowRules, monitors, themes, backups });
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  page: "dashboard",
  loading: false,
  error: null,
  toast: null,
  dashboard: null,
  keybindings: [],
  appearance: null,
  animations: [],
  wallpapers: [],
  startupApps: [],
  windowRules: [],
  monitors: [],
  themes: null,
  backups: [],
  setPage: (page) => set({ page }),
  clearToast: () => set({ toast: null }),
  notify: (toast) => set({ toast }),
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      await runLoaders(set);
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ loading: false });
    }
  },
  refreshPage: async () => {
    try {
      await runLoaders(set);
    } catch (error) {
      set({ error: String(error), toast: { title: "Refresh failed", detail: String(error), tone: "error" } });
    }
  },
  runQuickAction: async (action) => {
    await command("execute_quick_action", { action });
    set({ toast: { title: "Action executed", detail: action } });
  },
  saveKeybinding: async (binding) => {
    await command("save_keybinding", { binding });
    set({ keybindings: await command<Keybinding[]>("read_keybindings"), toast: { title: "Keybinding saved" } });
  },
  deleteKeybinding: async (binding) => {
    await command("delete_keybinding", { binding });
    set({ keybindings: await command<Keybinding[]>("read_keybindings"), toast: { title: "Keybinding deleted" } });
  },
  updateAppearance: async (key, value) => {
    set({ appearance: { ...(get().appearance ?? defaultAppearance), [key]: value } });
    await command("set_appearance_value", { key, value });
    set({ appearance: await command<AppearanceSettings>("read_appearance") });
  },
  switchAnimation: async (path) => {
    await command("switch_animation", { path });
    set({ animations: await command<AnimationPreset[]>("list_animations"), toast: { title: "Animation preset applied" } });
  },
  setWallpaper: async (path) => {
    await command("set_wallpaper", { path });
    set({
      dashboard: await command<DashboardSnapshot>("get_dashboard_snapshot"),
      toast: { title: "Wallpaper applied" },
    });
  },
  randomWallpaper: async () => {
    await command("random_wallpaper");
    set({
      dashboard: await command<DashboardSnapshot>("get_dashboard_snapshot"),
      toast: { title: "Random wallpaper applied" },
    });
  },
  saveStartupApp: async (app) => {
    await command("save_startup_app", { app });
    set({ startupApps: await command<StartupApp[]>("read_startup_apps"), toast: { title: "Startup app saved" } });
  },
  deleteStartupApp: async (app) => {
    await command("delete_startup_app", { app });
    set({ startupApps: await command<StartupApp[]>("read_startup_apps"), toast: { title: "Startup app removed" } });
  },
  saveWindowRule: async (rule) => {
    await command("save_window_rule", { rule });
    set({ windowRules: await command<WindowRule[]>("read_window_rules"), toast: { title: "Window rule saved" } });
  },
  deleteWindowRule: async (rule) => {
    await command("delete_window_rule", { rule });
    set({ windowRules: await command<WindowRule[]>("read_window_rules"), toast: { title: "Window rule removed" } });
  },
  saveMonitor: async (monitor) => {
    await command("save_monitor", { monitor });
    set({ monitors: await command<MonitorConfig[]>("read_monitors"), toast: { title: "Monitor updated" } });
  },
  applyTheme: async (kind, name) => {
    await command("apply_theme", { kind, name });
    set({ dashboard: await command<DashboardSnapshot>("get_dashboard_snapshot"), toast: { title: "Theme applied", detail: name } });
  },
  restoreBackup: async (path) => {
    await command("restore_backup", { path });
    await runLoaders(set);
    set({ toast: { title: "Backup restored" } });
  },
  exportConfig: async (destination) => {
    await command("export_config", { destination });
    set({ toast: { title: "Config exported", detail: destination } });
  },
  importConfig: async (source) => {
    await command("import_config", { source });
    await runLoaders(set);
    set({ toast: { title: "Config imported" } });
  },
}));

const defaultAppearance: AppearanceSettings = {
  gaps_in: "5",
  gaps_out: "10",
  border_size: "2",
  active_border_color: "rgba(33ccffee)",
  inactive_border_color: "rgba(595959aa)",
  blur: "true",
  rounding: "8",
  opacity: "1",
};

let subscribed = false;

export async function subscribeToConfigChanges() {
  if (subscribed) return;
  subscribed = true;
  await listen("hypr-config-changed", () => {
    void useSettingsStore.getState().refreshPage();
  });
}
