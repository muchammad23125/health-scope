import { supabase } from "@/lib/supabaseClient";

export type AdminProfile = {
  name: string | null;
  role: string;
  email: string;
};

export async function getCurrentAdmin() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      admin: null,
      session: null,
      error: sessionError,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("name, role")
    .eq("id", session.user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    await supabase.auth.signOut();

    return {
      admin: null,
      session: null,
      error: profileError,
    };
  }

  return {
    admin: {
      name: profile.name,
      role: profile.role,
      email: session.user.email ?? "",
    },
    session,
    error: null,
  };
}
