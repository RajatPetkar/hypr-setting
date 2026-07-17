import { Plus, RectangleHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import type { WindowRule } from "@/types/hypr";

const emptyRule: WindowRule = { id: "new", source: "", line_index: -1, enabled: true, kind: "windowrulev2", rule: "float", selector: "class:^(app)$" };

export function WindowRulesPage() {
  const { windowRules, saveWindowRule, deleteWindowRule } = useSettingsStore();
  const [editing, setEditing] = useState<WindowRule | null>(null);
  return (
    <>
      <PageHeader title="Window Rules" description="Add, edit, and remove windowrule and windowrulev2 entries." actions={<Button onClick={() => setEditing(emptyRule)}><Plus className="h-4 w-4" />Add</Button>} />
      {windowRules.length === 0 ? (
        <EmptyState icon={RectangleHorizontal} title="No window rules found" description="Create class, title, workspace, float, size, and opacity rules here." />
      ) : (
        <div className="space-y-2">
          {windowRules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <Switch checked={rule.enabled} onCheckedChange={(enabled) => saveWindowRule({ ...rule, enabled })} />
              <Badge>{rule.kind}</Badge>
              <button className="min-w-0 flex-1 truncate text-left text-sm" onClick={() => setEditing(rule)}>{rule.rule}, {rule.selector}</button>
              <Button variant="ghost" size="icon" onClick={() => deleteWindowRule(rule)} aria-label="Delete window rule"><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      )}
      <RuleDialog rule={editing} onClose={() => setEditing(null)} onSave={async (rule) => { await saveWindowRule(rule); setEditing(null); }} />
    </>
  );
}

function RuleDialog({ rule, onClose, onSave }: { rule: WindowRule | null; onClose: () => void; onSave: (rule: WindowRule) => Promise<void> }) {
  const [draft, setDraft] = useState(rule ?? emptyRule);
  useEffect(() => {
    setDraft(rule ?? emptyRule);
  }, [rule]);
  if (!rule) return null;
  return (
    <Dialog open={Boolean(rule)} onOpenChange={(open) => !open && onClose()} title="Window Rule">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3"><Label>Enabled</Label><Switch checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>Kind</Label><Select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value })}><option value="windowrulev2">windowrulev2</option><option value="windowrule">windowrule</option></Select></div>
          <div className="grid gap-2"><Label>Rule</Label><Input value={draft.rule} onChange={(event) => setDraft({ ...draft, rule: event.target.value })} /></div>
        </div>
        <div className="grid gap-2"><Label>Selector</Label><Input value={draft.selector} onChange={(event) => setDraft({ ...draft, selector: event.target.value })} /></div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => onSave(draft)}>Save</Button></div>
      </div>
    </Dialog>
  );
}
