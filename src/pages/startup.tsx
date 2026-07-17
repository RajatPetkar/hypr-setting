import { Plus, Rocket, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import type { StartupApp } from "@/types/hypr";

const emptyStartup: StartupApp = { id: "new", source: "", line_index: -1, enabled: true, command: "" };

export function StartupPage() {
  const { startupApps, saveStartupApp, deleteStartupApp } = useSettingsStore();
  const [editing, setEditing] = useState<StartupApp | null>(null);
  return (
    <>
      <PageHeader title="Startup Applications" description="Manage exec-once commands in your Startup_Apps.conf file." actions={<Button onClick={() => setEditing(emptyStartup)}><Plus className="h-4 w-4" />Add</Button>} />
      {startupApps.length === 0 ? (
        <EmptyState icon={Rocket} title="No startup apps configured" description="Add launch commands for Waybar, portals, wallpaper daemons, or personal scripts." />
      ) : (
        <div className="space-y-2">
          {startupApps.map((app) => (
            <div key={app.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <Switch checked={app.enabled} onCheckedChange={(enabled) => saveStartupApp({ ...app, enabled })} />
              <button className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => setEditing(app)}>{app.command}</button>
              <Button variant="ghost" size="icon" onClick={() => deleteStartupApp(app)} aria-label="Remove startup app"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
      <StartupDialog app={editing} onClose={() => setEditing(null)} onSave={async (app) => { await saveStartupApp(app); setEditing(null); }} />
    </>
  );
}

function StartupDialog({ app, onClose, onSave }: { app: StartupApp | null; onClose: () => void; onSave: (app: StartupApp) => Promise<void> }) {
  const [draft, setDraft] = useState(app ?? emptyStartup);
  useEffect(() => {
    setDraft(app ?? emptyStartup);
  }, [app]);
  if (!app) return null;
  return (
    <Dialog open={Boolean(app)} onOpenChange={(open) => !open && onClose()} title="Startup App">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3">
          <Label>Enabled</Label>
          <Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} />
        </div>
        <div className="grid gap-2">
          <Label>Command</Label>
          <Input value={draft.command} onChange={(event) => setDraft({ ...draft, command: event.target.value })} placeholder="waybar" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </div>
      </div>
    </Dialog>
  );
}
