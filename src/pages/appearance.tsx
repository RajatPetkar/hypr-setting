import { Paintbrush } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/store/settings-store";
import type { AppearanceSettings } from "@/types/hypr";

const sliderFields: Array<{ key: keyof AppearanceSettings; label: string; min: number; max: number; step?: number }> = [
  { key: "gaps_in", label: "Inner gaps", min: 0, max: 40 },
  { key: "gaps_out", label: "Outer gaps", min: 0, max: 80 },
  { key: "border_size", label: "Border size", min: 0, max: 12 },
  { key: "rounding", label: "Rounding", min: 0, max: 30 },
  { key: "opacity", label: "Opacity", min: 0.2, max: 1, step: 0.01 },
];

export function AppearancePage() {
  const { appearance, updateAppearance } = useSettingsStore();
  const settings = appearance;

  return (
    <>
      <PageHeader title="Appearance" description="Adjust Hyprland gaps, borders, blur, rounding, colors, and window opacity." />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Layout and Decorations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {sliderFields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>{field.label}</Label>
                  <Input
                    className="h-8 w-24"
                    value={settings?.[field.key] ?? ""}
                    onChange={(event) => updateAppearance(field.key, event.target.value)}
                  />
                </div>
                <Slider
                  min={field.min}
                  max={field.max}
                  step={field.step ?? 1}
                  value={Number(settings?.[field.key] ?? 0)}
                  onChange={(event) => updateAppearance(field.key, event.currentTarget.value)}
                />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
              <div>
                <Label>Blur</Label>
                <p className="mt-1 text-sm text-muted-foreground">Toggle Hyprland decoration blur.</p>
              </div>
              <Switch checked={(settings?.blur ?? "false") === "true"} onCheckedChange={(checked) => updateAppearance("blur", String(checked))} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Border Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Active border</Label>
              <Input value={settings?.active_border_color ?? ""} onChange={(event) => updateAppearance("active_border_color", event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Inactive border</Label>
              <Input value={settings?.inactive_border_color ?? ""} onChange={(event) => updateAppearance("inactive_border_color", event.target.value)} />
            </div>
            <div className="rounded-lg border bg-background p-4">
              <Paintbrush className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Hypr Settings accepts Hyprland color values such as rgba(33ccffee) and applies changes immediately with hyprctl keyword.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
