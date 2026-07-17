import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToastProps = {
  title: string;
  detail?: string;
  tone?: "default" | "error";
  onClose: () => void;
};

export function Toast({ title, detail, tone = "default", onClose }: ToastProps) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-lg border bg-card p-4 shadow-panel">
      <Icon className={tone === "error" ? "mt-0.5 h-5 w-5 text-destructive" : "mt-0.5 h-5 w-5 text-primary"} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        {detail ? <div className="mt-1 break-words text-xs text-muted-foreground">{detail}</div> : null}
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
