import { Image, Shuffle } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prettyPath } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";

export function WallpapersPage() {
  const { wallpapers, setWallpaper, randomWallpaper } = useSettingsStore();
  return (
    <>
      <PageHeader
        title="Wallpapers"
        description="Browse wallpapers from ~/Pictures/Wallpapers and ~/.config/hypr/wallpapers, then apply through swww or hyprpaper."
        actions={
          <Button onClick={randomWallpaper}>
            <Shuffle className="h-4 w-4" />
            Random
          </Button>
        }
      />
      {wallpapers.length === 0 ? (
        <EmptyState icon={Image} title="No wallpapers found" description="Add png, jpg, jpeg, or webp files to your wallpapers directory." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wallpapers.map((wallpaper) => (
            <Card key={wallpaper.path}>
              <CardContent className="p-3">
                <div className="relative aspect-video overflow-hidden rounded-md border bg-secondary">
                  <img
                    src={convertFileSrc(wallpaper.path)}
                    alt={wallpaper.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="truncate text-xs font-medium text-white">{wallpaper.name}</div>
                  </div>
                </div>
                <div className="mt-3 truncate text-xs text-muted-foreground">{prettyPath(wallpaper.path)}</div>
                <Button className="mt-3 w-full" variant="secondary" onClick={() => setWallpaper(wallpaper.path)}>
                  Set Wallpaper
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
