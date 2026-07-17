import { Archive, DatabaseBackup, Download, Upload } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prettyPath } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";

export function BackupsPage() {
  const { backups, restoreBackup, exportConfig, importConfig } = useSettingsStore();
  const [exportPath, setExportPath] = useState("");
  const [importPath, setImportPath] = useState("");
  return (
    <>
      <PageHeader title="Backups" description="Restore timestamped backups, export your Hyprland config, or import a config folder." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <Label>Export destination</Label>
            <div className="flex gap-2">
              <Input value={exportPath} onChange={(event) => setExportPath(event.target.value)} placeholder="/home/you/hypr-export" />
              <Button onClick={() => exportConfig(exportPath)} disabled={!exportPath}><Download className="h-4 w-4" />Export</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <Label>Import source</Label>
            <div className="flex gap-2">
              <Input value={importPath} onChange={(event) => setImportPath(event.target.value)} placeholder="/home/you/hypr-export" />
              <Button variant="secondary" onClick={() => importConfig(importPath)} disabled={!importPath}><Upload className="h-4 w-4" />Import</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        {backups.length === 0 ? (
          <EmptyState icon={DatabaseBackup} title="No backups yet" description="Backups are created automatically before Hypr Settings modifies config files." />
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div key={backup.path} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <Archive className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{backup.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{prettyPath(backup.path)} · {backup.created_at}</div>
                </div>
                <Button variant="outline" onClick={() => restoreBackup(backup.path)}>Restore</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
