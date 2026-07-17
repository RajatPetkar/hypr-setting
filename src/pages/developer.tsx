import { useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Github, Heart } from "lucide-react";
import { useSettingsStore } from "@/store/settings-store";
import { command } from "@/lib/tauri";

const DEVELOPER = {
  name: "Rajat Petkar",
  email: "rajatpetkar250@gmail.com",
  github: "https://github.com/rajatpetkar",
};

export function DeveloperPage() {
  const { notify } = useSettingsStore();

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DEVELOPER.email);
      notify({ title: "Copied email", detail: DEVELOPER.email });
    } catch (e) {
      notify({ title: "Copy failed", detail: String(e), tone: "error" });
    }
  }, [notify]);

  const openGithub = useCallback(() => {
    (async () => {
      try {
        await command("open_url", { url: DEVELOPER.github });
        notify({ title: "Opened GitHub", detail: DEVELOPER.github });
      } catch (e) {
        notify({ title: "Failed to open GitHub", detail: String(e), tone: "error" });
      }
    })();
  }, []);

  return (
    <>
      <PageHeader title="Developer" description="Contact and contribution information" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">RP</div>
              <div>
                <div className="text-sm font-semibold">{DEVELOPER.name}</div>
                <div className="text-xs text-muted-foreground">Open-source maintainer & contributor</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={copyEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Copy Email
              </Button>
              <Button variant="secondary" size="sm" onClick={openGithub}>
                <Github className="mr-2 h-4 w-4" />
                View GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Hypr Settings is an open-source control center for Hyprland. Contributions, issues, and PRs are welcome on GitHub.</p>
            <div className="mt-6 text-sm text-muted-foreground">Made with <Heart className="inline-block mx-1 text-destructive" /> by Rajat</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default DeveloperPage;
