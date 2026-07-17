import { invoke } from "@tauri-apps/api/core";

export async function command<T>(name: string, args?: Record<string, unknown>) {
  return invoke<T>(name, args);
}
