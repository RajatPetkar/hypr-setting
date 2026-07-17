import { Clapperboard, Play } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settings-store";
import { prettyPath } from "@/lib/utils";

export function AnimationsPage() {
  const { animations, switchAnimation } = useSettingsStore();
  return (
    <>
      <PageHeader title="Animations" description="Preview animation preset files from ~/.config/hypr/animations and switch the active preset." />
      {animations.length === 0 ? (
        <EmptyState icon={Clapperboard} title="No animation presets found" description="Place .conf files in ~/.config/hypr/animations to manage them here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {animations.map((preset) => (
            <Card key={preset.path}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{preset.name}</div>
                    <div className="mt-1 break-words text-xs text-muted-foreground">{prettyPath(preset.path)}</div>
                  </div>
                  {preset.active ? <Badge>Active</Badge> : null}
                </div>
                <div className="mt-4 h-20 overflow-hidden rounded-lg border bg-background p-3 text-xs text-muted-foreground">
                  {preset.preview.length > 0 ? preset.preview.join("\n") : "No previewable lines"}
                </div>
                <Button className="mt-4 w-full" variant={preset.active ? "secondary" : "default"} onClick={() => switchAnimation(preset.path)}>
                  <Play className="h-4 w-4" />
                  {preset.active ? "Reapply Preset" : "Switch Preset"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
