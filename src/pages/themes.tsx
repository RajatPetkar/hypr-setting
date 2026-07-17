import { Paintbrush } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { useState } from "react";

export function ThemesPage() {
  const { themes, applyTheme } = useSettingsStore();
  const [gtk, setGtk] = useState("");
  const [icons, setIcons] = useState("");
  const [cursor, setCursor] = useState("");
  return (
    <>
      <PageHeader title="Theme Manager" description="Integrate with Wallust, GTK themes, icon themes, and cursor themes installed on your Arch Linux system." />
      <div className="grid gap-4 lg:grid-cols-3">
        <ThemeCard title="GTK Theme" value={gtk} values={themes?.gtk_themes ?? []} onChange={setGtk} onApply={() => applyTheme("gtk", gtk)} />
        <ThemeCard title="Icon Theme" value={icons} values={themes?.icon_themes ?? []} onChange={setIcons} onApply={() => applyTheme("icons", icons)} />
        <ThemeCard title="Cursor Theme" value={cursor} values={themes?.cursor_themes ?? []} onChange={setCursor} onApply={() => applyTheme("cursor", cursor)} />
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary" />Wallust</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <Badge>{themes?.wallust_available ? "Available" : "Not installed"}</Badge>
            <p className="mt-3 text-sm text-muted-foreground">When installed, wallpaper changes can be paired with wallust color generation from the backend.</p>
          </div>
          <Button variant="secondary" disabled={!themes?.wallust_available} onClick={() => applyTheme("wallust", "current")}>Run Wallust</Button>
        </CardContent>
      </Card>
    </>
  );
}

function ThemeCard({ title, value, values, onChange, onApply }: { title: string; value: string; values: string[]; onChange: (value: string) => void; onApply: () => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select theme</option>
          {values.map((theme) => <option key={theme} value={theme}>{theme}</option>)}
        </Select>
        <Button className="w-full" disabled={!value} onClick={onApply}>Apply</Button>
      </CardContent>
    </Card>
  );
}
