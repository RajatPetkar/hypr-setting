import { Download, Keyboard, Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import type { Keybinding } from "@/types/hypr";

const emptyBinding: Keybinding = {
  id: "new",
  source: "",
  line_index: -1,
  enabled: true,
  modifiers: "$mainMod",
  key: "",
  dispatcher: "exec",
  command: "",
  description: "",
  category: "Custom",
  conflict: false,
};

export function KeybindingsPage() {
  const { keybindings, saveKeybinding, deleteKeybinding, notify } = useSettingsStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Keybinding | null>(null);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return keybindings.filter((binding) =>
      [binding.modifiers, binding.key, binding.command, binding.description, binding.category].join(" ").toLowerCase().includes(needle),
    );
  }, [keybindings, query]);

  return (
    <>
      <PageHeader
        title="Keybindings"
        description="Search, edit, create, remove, import, and export shortcuts from configs/Keybinds.conf and UserConfigs/UserKeybinds.conf."
        actions={
          <>
            <Button variant="outline" onClick={() => notify({ title: "Export path required", detail: "Use Backups > Export config for full config export." })}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => notify({ title: "Import path required", detail: "Use Backups > Import config for full config import." })}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={() => setEditing(emptyBinding)}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </>
        }
      />
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search shortcuts" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Keyboard} title="No keybindings match" description="Create a user shortcut or change the search query." />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-[1.1fr_1.2fr_1.6fr_100px] gap-3 border-b bg-muted px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
            <span>Shortcut</span>
            <span>Description</span>
            <span>Command</span>
            <span>Edit</span>
          </div>
          {filtered.map((binding) => (
            <div key={binding.id} className="grid grid-cols-[1.1fr_1.2fr_1.6fr_100px] items-center gap-3 border-b px-4 py-3 last:border-b-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Badge>{binding.modifiers}</Badge>
                <Badge>{binding.key}</Badge>
                {binding.conflict ? <Badge className="border-destructive text-destructive">Conflict</Badge> : null}
              </div>
              <div className="truncate text-sm">{binding.description || binding.category}</div>
              <div className="truncate text-sm text-muted-foreground">{binding.command || binding.dispatcher}</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditing(binding)}>
                  Edit
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteKeybinding(binding)} aria-label="Delete keybinding">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <BindingDialog
        binding={editing}
        onClose={() => setEditing(null)}
        onSave={async (binding) => {
          await saveKeybinding(binding);
          setEditing(null);
        }}
      />
    </>
  );
}

function BindingDialog({ binding, onClose, onSave }: { binding: Keybinding | null; onClose: () => void; onSave: (binding: Keybinding) => Promise<void> }) {
  const [draft, setDraft] = useState<Keybinding>(binding ?? emptyBinding);
  useEffect(() => {
    setDraft(binding ?? emptyBinding);
  }, [binding]);
  if (!binding) return null;

  return (
    <Dialog open={Boolean(binding)} onOpenChange={(open) => !open && onClose()} title="Edit Keybinding">
      <div className="grid gap-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3">
          <Label>Enabled</Label>
          <Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Modifiers</Label>
            <Input value={draft.modifiers} onChange={(event) => setDraft({ ...draft, modifiers: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Key</Label>
            <Input value={draft.key} onChange={(event) => setDraft({ ...draft, key: event.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Dispatcher</Label>
            <Select value={draft.dispatcher} onChange={(event) => setDraft({ ...draft, dispatcher: event.target.value })}>
              <option value="exec">exec</option>
              <option value="workspace">workspace</option>
              <option value="movetoworkspace">movetoworkspace</option>
              <option value="killactive">killactive</option>
              <option value="fullscreen">fullscreen</option>
              <option value="togglefloating">togglefloating</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Command</Label>
          <Input value={draft.command} onChange={(event) => setDraft({ ...draft, command: event.target.value })} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </div>
      </div>
    </Dialog>
  );
}
