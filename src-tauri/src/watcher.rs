use crate::backups::hypr_dir;
use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use tauri::{AppHandle, Emitter};

pub fn start(app: AppHandle) {
    std::thread::spawn(move || {
        let app_handle = app.clone();
        let mut watcher = match RecommendedWatcher::new(
            move |result: notify::Result<Event>| {
                if result.is_ok() {
                    let _ = app_handle.emit("hypr-config-changed", ());
                }
            },
            Config::default(),
        ) {
            Ok(watcher) => watcher,
            Err(_) => return,
        };
        let _ = watcher.watch(&hypr_dir(), RecursiveMode::Recursive);
        loop {
            std::thread::park();
        }
    });
}
