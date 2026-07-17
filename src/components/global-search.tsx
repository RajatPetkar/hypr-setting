import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { findPageForSearch } from "./navigation";
import type { PageId } from "@/types/hypr";

type GlobalSearchProps = {
  onNavigate: (page: PageId) => void;
};

export function GlobalSearch({ onNavigate }: GlobalSearchProps) {
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search settings: wallpaper, gaps, terminal, blur, animations"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          const page = findPageForSearch(event.currentTarget.value);
          if (page) {
            onNavigate(page);
            event.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}
