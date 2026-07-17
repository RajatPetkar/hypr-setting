import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navItems } from "./navigation";
import type { PageId } from "@/types/hypr";

type SidebarProps = {
  page: PageId;
  onPageChange: (page: PageId) => void;
};

export function Sidebar({ page, onPageChange }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Hypr Settings</div>
          <div className="text-xs text-muted-foreground">Control Center</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "h-10 w-full justify-start px-3 text-muted-foreground",
                active && "bg-secondary text-foreground",
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
