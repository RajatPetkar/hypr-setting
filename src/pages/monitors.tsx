import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import type { MonitorConfig } from "@/types/hypr";

export function MonitorsPage() {
  const { monitors, saveMonitor } = useSettingsStore();
  const [editing, setEditing] = useState<MonitorConfig | null>(null);
  return (
    <>
      <PageHeader title="Monitor Settings" description="Edit monitor resolution, refresh rate, scaling, position, and enabled state from monitors.conf." />
      {monitors.length === 0 ? (
        <EmptyState icon={Monitor} title="No monitors configured" description="Hypr Settings reads monitor lines from ~/.config/hypr/monitors.conf." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {monitors.map((monitor) => (
            <button key={monitor.id} className="rounded-lg border bg-card p-5 text-left transition-colors hover:bg-secondary" onClick={() => setEditing(monitor)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold"><Monitor className="h-4 w-4 text-primary" />{monitor.name}</div>
                <Badge>{monitor.enabled ? "Enabled" : "Disabled"}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <span>{monitor.resolution}</span>
                <span>{monitor.refresh_rate}</span>
                <span>{monitor.position}</span>
                <span>Scale {monitor.scale}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <MonitorDialog monitor={editing} onClose={() => setEditing(null)} onSave={async (monitor) => { await saveMonitor(monitor); setEditing(null); }} />
    </>
  );
}

function MonitorDialog({ monitor, onClose, onSave }: { monitor: MonitorConfig | null; onClose: () => void; onSave: (monitor: MonitorConfig) => Promise<void> }) {
  const [draft, setDraft] = useState(monitor);
  useEffect(() => {
    setDraft(monitor);
  }, [monitor]);
  if (!monitor || !draft) return null;
  return (
    <Dialog open={Boolean(monitor)} onOpenChange={(open) => !open && onClose()} title="Monitor">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3"><Label>Enabled</Label><Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>Name</Label><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div>
          <div className="grid gap-2"><Label>Resolution</Label><Input value={draft.resolution} onChange={(event) => setDraft({ ...draft, resolution: event.target.value })} placeholder="1920x1080" /></div>
          <div className="grid gap-2"><Label>Refresh rate</Label><Input value={draft.refresh_rate} onChange={(event) => setDraft({ ...draft, refresh_rate: event.target.value })} placeholder="60" /></div>
          <div className="grid gap-2"><Label>Position</Label><Input value={draft.position} onChange={(event) => setDraft({ ...draft, position: event.target.value })} placeholder="0x0" /></div>
          <div className="grid gap-2"><Label>Scale</Label><Input value={draft.scale} onChange={(event) => setDraft({ ...draft, scale: event.target.value })} placeholder="1" /></div>
        </div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(draft)}>Save</Button></div>
      </div>
    </Dialog>
  );
}
