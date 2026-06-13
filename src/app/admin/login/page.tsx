"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentAdmin } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { admin } = await getCurrentAdmin();

      if (admin) {
        router.replace("/admin/berita");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password.trim()) {
      alert("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (authError) {
        console.error("Supabase auth login error:", authError);

        alert(
          "Login gagal. Pastikan user sudah dibuat di Supabase Authentication, email sudah confirmed, dan password benar.",
        );
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        alert("Login gagal. Data user tidak ditemukan.");
        return;
      }

      console.log("Login Supabase berhasil. User ID:", userId);

      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Admin profile error:", profileError);
        await supabase.auth.signOut();

        alert(
          "Login berhasil, tetapi data admin_profiles tidak bisa dibaca. Cek RLS policy dan data admin_profiles.",
        );
        return;
      }

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();

        alert(
          "Login berhasil, tetapi akun ini belum memiliki role admin di table admin_profiles.",
        );
        return;
      }

      router.replace("/admin/berita");
    } catch (error) {
      console.error("Unexpected login error:", error);
      alert("Terjadi error tidak terduga saat login admin.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
          Memeriksa sesi admin...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_460px] lg:items-center">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              Health Scope Admin
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Login Admin Dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Masuk untuk mengelola kategori dan berita kesehatan yang akan
              tampil pada website utama Health Scope.
            </p>

            <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-900">
                Modul yang diamankan
              </p>
              <p className="mt-1">
                Hanya admin yang terdaftar di Supabase Auth dan tabel
                admin_profiles yang dapat mengakses dashboard manajemen berita.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Masuk Admin</h2>
              <p className="mt-2 text-sm text-slate-500">
                Gunakan email dan password admin yang sudah dibuat di Supabase.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Admin
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@healthscope.id"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Memproses login..." : "Login Admin"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Kembali ke Website Utama
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
