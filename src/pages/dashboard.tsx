import { Lock, Monitor, RefreshCw, RotateCcw, Terminal } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { prettyPath } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";

export function Dashboard() {
  const { dashboard, wallpapers, runQuickAction } = useSettingsStore();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live overview of your Hyprland session and the common actions you use while tuning the desktop."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboard?.current_theme || "Unknown"}</div>
            <p className="mt-2 text-sm text-muted-foreground">GTK or Wallust theme detected from your environment.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Animation Preset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dashboard?.active_animation || "Default"}</div>
            <p className="mt-2 text-sm text-muted-foreground">The active preset stored in UserAnimations.conf.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hypr Config</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="break-words text-sm font-medium">{dashboard ? prettyPath(dashboard.hypr_config_dir) : "~/.config/hypr"}</div>
            <p className="mt-2 text-sm text-muted-foreground">Backups are created before write operations.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Developer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Rajat Petkar</div>
            <div className="mt-1 text-xs text-muted-foreground">rajatpetkar250@gmail.com</div>
            <div className="mt-1 text-xs text-muted-foreground">github.com/rajatpetkar</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Wallpaper</CardTitle>
          </CardHeader>
          <CardContent>
            {(dashboard?.wallpaper || (wallpapers && wallpapers.length > 0)) ? (
              <div className="overflow-hidden rounded-lg border bg-secondary">
                <div className="relative aspect-video">
                  <img
                    src={convertFileSrc(dashboard?.wallpaper ?? wallpapers[0].path)}
                    alt="Current wallpaper preview"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="text-sm font-medium text-white">{prettyPath(dashboard?.wallpaper ?? wallpapers[0].path)}</div>
                    <p className="mt-1 text-xs text-white/80">Uses swww, hyprpaper, or your configured wallpaper path when available.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-36 items-end rounded-lg border bg-secondary p-4">
                <div>
                  <div className="text-sm font-medium">No wallpaper detected</div>
                  <p className="mt-1 text-xs text-muted-foreground">Uses swww, hyprpaper, or your configured wallpaper path when available.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => runQuickAction("reload")}>
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
            <Button variant="secondary" onClick={() => runQuickAction("terminal")}>
              <Terminal className="h-4 w-4" />
              Terminal
            </Button>
            <Button variant="secondary" onClick={() => runQuickAction("lock")}>
              <Lock className="h-4 w-4" />
              Lock
            </Button>
            <Button variant="secondary" onClick={() => runQuickAction("waybar")}>
              <RotateCcw className="h-4 w-4" />
              Waybar
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Monitors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {(dashboard?.monitors ?? []).map((monitor) => (
            <div key={monitor.id} className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Monitor className="h-4 w-4 text-primary" />
                  {monitor.name}
                </div>
                <Badge>{monitor.enabled ? "Enabled" : "Disabled"}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <span>{monitor.resolution}</span>
                <span>{monitor.refresh_rate}</span>
                <span>{monitor.position}</span>
                <span>Scale {monitor.scale}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
