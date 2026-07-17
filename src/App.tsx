import { useEffect } from "react";
import { Loader2, Moon, RefreshCw, Sun } from "lucide-react";
import { GlobalSearch } from "@/components/global-search";
import { Sidebar } from "@/components/sidebar";
import { Toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { AppearancePage } from "@/pages/appearance";
import { AnimationsPage } from "@/pages/animations";
import { BackupsPage } from "@/pages/backups";
import { Dashboard } from "@/pages/dashboard";
import { KeybindingsPage } from "@/pages/keybindings";
import { MonitorsPage } from "@/pages/monitors";
import { StartupPage } from "@/pages/startup";
import { ThemesPage } from "@/pages/themes";
import { WallpapersPage } from "@/pages/wallpapers";
import { WindowRulesPage } from "@/pages/window-rules";
import { DeveloperPage } from "@/pages/developer";
import { subscribeToConfigChanges, useSettingsStore } from "@/store/settings-store";

export default function App() {
  const { page, setPage, loadAll, refreshPage, loading, error, toast, clearToast } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    void loadAll();
    void subscribeToConfigChanges();
  }, [loadAll]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar page={page} onPageChange={setPage} />
      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-6">
          <GlobalSearch onNavigate={setPage} />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => document.documentElement.classList.toggle("dark")} aria-label="Toggle dark mode">
              <Moon className="hidden h-4 w-4 dark:block" />
              <Sun className="h-4 w-4 dark:hidden" />
            </Button>
            <Button variant="outline" onClick={refreshPage} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error ? <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
          {page === "dashboard" && <Dashboard />}
          {page === "keybindings" && <KeybindingsPage />}
          {page === "appearance" && <AppearancePage />}
          {page === "animations" && <AnimationsPage />}
          {page === "wallpapers" && <WallpapersPage />}
          {page === "startup" && <StartupPage />}
          {page === "window-rules" && <WindowRulesPage />}
          {page === "monitors" && <MonitorsPage />}
          {page === "themes" && <ThemesPage />}
          {page === "backups" && <BackupsPage />}
          {page === "developer" && <DeveloperPage />}
        </section>
      </main>
      {toast ? <Toast {...toast} onClose={clearToast} /> : null}
    </div>
  );
}
