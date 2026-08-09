import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { VaultItem } from "./vault";

export const vaultItemsQuery = queryOptions({
  queryKey: ["vault-items"],
  queryFn: async (): Promise<VaultItem[]> => {
    const { data, error } = await supabase
      .from("vault_items")
      .select("*")
      .order("favorite", { ascending: false })
      .order("name");
    if (error) throw error;
    return (data ?? []) as VaultItem[];
  },
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw error;
    return { profile: data, email: auth.user.email ?? "" };
  },
});