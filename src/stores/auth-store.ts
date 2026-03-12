"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type Plan = "free" | "pro";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  generation_count_month: number;
  generation_reset_at: string;
  created_at: string;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    const supabase = createClient();

    // Get current session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      set({ user });
      await get().fetchProfile();
    }

    set({ loading: false, initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      set({ user: newUser });

      if (newUser) {
        await get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
