"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/config";
import type { Database } from "@/lib/database.types";

// Only needed when extending the starter with browser subscriptions or uploads.
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}
