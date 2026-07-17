import type { PageId } from "@/types/hypr";
import {
  Brush,
  Clapperboard,
  DatabaseBackup,
  Gauge,
  Image,
  Keyboard,
  Monitor,
  Paintbrush,
  Play,
  RectangleHorizontal,
  Rocket,
} from "lucide-react";

export type NavItem = {
  id: PageId;
  label: string;
  keywords: string[];
  icon: typeof Gauge;
};

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, keywords: ["home", "reload", "terminal", "lock", "waybar"] },
  { id: "keybindings", label: "Keybindings", icon: Keyboard, keywords: ["shortcuts", "keyboard", "bind", "terminal", "command"] },
  { id: "appearance", label: "Appearance", icon: Brush, keywords: ["gaps", "border", "blur", "rounding", "opacity", "color"] },
  { id: "animations", label: "Animations", icon: Clapperboard, keywords: ["animation", "preset", "speed", "bezier"] },
  { id: "wallpapers", label: "Wallpapers", icon: Image, keywords: ["wallpaper", "background", "slideshow", "random"] },
  { id: "startup", label: "Startup Apps", icon: Rocket, keywords: ["startup", "exec-once", "autostart"] },
  { id: "window-rules", label: "Window Rules", icon: RectangleHorizontal, keywords: ["windowrule", "float", "workspace", "opacity"] },
  { id: "monitors", label: "Monitors", icon: Monitor, keywords: ["display", "resolution", "refresh", "scale", "position"] },
  { id: "themes", label: "Themes", icon: Paintbrush, keywords: ["wallust", "gtk", "icons", "cursor", "theme"] },
  { id: "backups", label: "Backups", icon: DatabaseBackup, keywords: ["backup", "restore", "export", "import", "safety"] },
  { id: "developer", label: "Developer", icon: Rocket, keywords: ["developer", "contact", "about"] },
];

export function findPageForSearch(query: string): PageId | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  return navItems.find((item) => item.label.toLowerCase().includes(normalized) || item.keywords.some((keyword) => keyword.includes(normalized)))?.id ?? null;
}
