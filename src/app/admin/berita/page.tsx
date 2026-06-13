"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentAdmin, type AdminProfile } from "@/lib/adminAuth";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
};

type Article = {
  id: string;
  categoryId: string | null;
  categoryName: string;
  slug: string;
  imageUrl: string | null;
  imagePath: string | null;
  title: string;
  publishedDate: string;
  description: string;
  status: string;
};

type ArticleRow = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  image_url: string | null;
  image_path: string | null;
  published_date: string;
  status: string;
  categories: Category | Category[] | null;
};

type ArticleForm = {
  categoryId: string;
  imageUrl: string;
  imageName: string;
  title: string;
  publishedDate: string;
  description: string;
};

type ActiveView = "dashboard" | "article-form" | "category-form";

const ARTICLE_IMAGE_BUCKET = "article-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm: ArticleForm = {
  categoryId: "",
  imageUrl: "",
  imageName: "",
  title: "",
  publishedDate: new Date().toISOString().slice(0, 10),
  description: "",
};

function createSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function createArticleSlug(title: string) {
  return `${createSlug(title)}-${Date.now().toString(36)}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function getCategoryClass(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("dbd")) return "bg-red-100 text-red-700";
  if (normalized.includes("ispa")) return "bg-blue-100 text-blue-700";
  if (normalized.includes("diare")) return "bg-orange-100 text-orange-700";
  if (normalized.includes("leptospirosis"))
    return "bg-purple-100 text-purple-700";

  return "bg-teal-100 text-teal-700";
}

function normalizeArticle(row: ArticleRow): Article {
  const relation = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: relation?.name ?? "Tanpa Kategori",
    slug: row.slug,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    title: row.title,
    publishedDate: row.published_date,
    description: row.description,
    status: row.status,
  };
}

export default function AdminBeritaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ArticleForm>(emptyForm);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const [dataLoading, setDataLoading] = useState(true);
  const [savingArticle, setSavingArticle] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(
    null,
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );

  async function fetchCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, created_at, updated_at")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const loadedCategories = data ?? [];

    setCategories(loadedCategories);

    setForm((prev) => ({
      ...prev,
      categoryId: prev.categoryId || loadedCategories[0]?.id || "",
    }));

    return loadedCategories;
  }

  async function fetchArticles() {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        id,
        category_id,
        title,
        slug,
        description,
        image_url,
        image_path,
        published_date,
        status,
        categories:category_id (
          id,
          name,
          slug
        )
      `,
      )
      .order("published_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    setArticles(((data ?? []) as ArticleRow[]).map(normalizeArticle));
  }

  async function fetchInitialData() {
    try {
      setDataLoading(true);
      await fetchCategories();
      await fetchArticles();
    } catch (error) {
      console.error("Gagal mengambil data Supabase:", error);
      alert("Gagal mengambil data dari Supabase. Cek policy RLS dan koneksi.");
    } finally {
      setDataLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function checkAdminSession() {
      const { admin } = await getCurrentAdmin();

      if (!admin) {
        router.replace("/admin/login");
        return;
      }

      if (isMounted) {
        setAdminProfile(admin);
        setAuthLoading(false);
      }
    }

    checkAdminSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/admin/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (authLoading) return;

    fetchInitialData();
  }, [authLoading]);

  const filteredArticles = articles.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      article.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      article.categoryName.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchCategory =
      categoryFilter === "Semua" || article.categoryId === categoryFilter;

    return matchSearch && matchCategory;
  });

  function resetForm() {
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? "",
      publishedDate: new Date().toISOString().slice(0, 10),
    });

    setEditingId(null);
    setSelectedImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetCategoryForm() {
    setNewCategory("");
    setEditingCategoryId(null);
  }

  function openDashboard() {
    resetForm();
    resetCategoryForm();
    setActiveView("dashboard");
  }

  function openCreateArticle() {
    resetForm();
    setActiveView("article-form");
  }

  function openCategoryForm() {
    resetForm();
    setActiveView("category-form");
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("Format gambar harus JPG, JPEG, atau PNG.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Ukuran gambar maksimal 5 MB.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        imageUrl: String(reader.result),
        imageName: file.name,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function uploadArticleImage(file: File) {
    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const safeFileName = `${Date.now()}-${createSlug(
      fileNameWithoutExtension,
    )}.${extension}`;
    const imagePath = `articles/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .upload(imagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(ARTICLE_IMAGE_BUCKET)
      .getPublicUrl(imagePath);

    return {
      imageUrl: data.publicUrl,
      imagePath,
      imageName: file.name,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.categoryId) {
      alert("Kategori wajib dipilih.");
      return;
    }

    if (!form.title.trim()) {
      alert("Judul berita wajib diisi.");
      return;
    }

    if (!form.publishedDate) {
      alert("Tanggal publikasi wajib diisi.");
      return;
    }

    if (!form.description.trim()) {
      alert("Deskripsi berita wajib diisi.");
      return;
    }

    if (!form.imageUrl && !selectedImageFile) {
      alert("Gambar berita wajib diunggah.");
      return;
    }

    try {
      setSavingArticle(true);

      const existingArticle = editingId
        ? articles.find((article) => article.id === editingId)
        : null;

      let imageUrl = existingArticle?.imageUrl ?? form.imageUrl;
      let imagePath = existingArticle?.imagePath ?? null;

      if (selectedImageFile) {
        const uploadedImage = await uploadArticleImage(selectedImageFile);
        imageUrl = uploadedImage.imageUrl;
        imagePath = uploadedImage.imagePath;
      }

      if (editingId) {
        const { error } = await supabase
          .from("articles")
          .update({
            category_id: form.categoryId,
            title: form.title.trim(),
            description: form.description.trim(),
            image_url: imageUrl,
            image_path: imagePath,
            published_date: form.publishedDate,
            status: "published",
          })
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        if (
          selectedImageFile &&
          existingArticle?.imagePath &&
          existingArticle.imagePath !== imagePath
        ) {
          await supabase.storage
            .from(ARTICLE_IMAGE_BUCKET)
            .remove([existingArticle.imagePath]);
        }

        alert("Berita berhasil diperbarui.");
      } else {
        const { error } = await supabase.from("articles").insert({
          category_id: form.categoryId,
          title: form.title.trim(),
          slug: createArticleSlug(form.title.trim()),
          description: form.description.trim(),
          image_url: imageUrl,
          image_path: imagePath,
          published_date: form.publishedDate,
          status: "published",
        });

        if (error) {
          throw error;
        }

        alert("Berita berhasil ditambahkan.");
      }

      await fetchArticles();
      resetForm();
      setActiveView("dashboard");
    } catch (error) {
      console.error("Gagal menyimpan berita:", error);
      alert(
        "Gagal menyimpan berita ke Supabase. Cek RLS policy, bucket Storage, dan data form.",
      );
    } finally {
      setSavingArticle(false);
    }
  }

  function handleEdit(article: Article) {
    setEditingId(article.id);
    setSelectedImageFile(null);

    setForm({
      categoryId: article.categoryId ?? "",
      imageUrl: article.imageUrl ?? "",
      imageName: article.imagePath?.split("/").pop() ?? "Gambar berita",
      title: article.title,
      publishedDate: article.publishedDate,
      description: article.description,
    });

    setActiveView("article-form");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(article: Article) {
    const confirmed = confirm("Yakin ingin menghapus berita ini?");

    if (!confirmed) return;

    try {
      setDeletingArticleId(article.id);

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", article.id);

      if (error) {
        throw error;
      }

      if (article.imagePath) {
        await supabase.storage
          .from(ARTICLE_IMAGE_BUCKET)
          .remove([article.imagePath]);
      }

      setArticles((prev) => prev.filter((item) => item.id !== article.id));

      if (editingId === article.id) {
        resetForm();
        setActiveView("dashboard");
      }

      alert("Berita berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus berita:", error);
      alert("Gagal menghapus berita dari Supabase.");
    } finally {
      setDeletingArticleId(null);
    }
  }

  async function handleSaveCategory() {
    const trimmedCategory = newCategory.trim();

    if (!trimmedCategory) {
      alert("Nama kategori tidak boleh kosong.");
      return;
    }

    const slug = createSlug(trimmedCategory);

    const alreadyExists = categories.some(
      (category) => category.slug === slug && category.id !== editingCategoryId,
    );

    if (alreadyExists) {
      alert("Kategori sudah tersedia.");
      return;
    }

    try {
      setSavingCategory(true);

      if (editingCategoryId) {
        const { data, error } = await supabase
          .from("categories")
          .update({
            name: trimmedCategory,
            slug,
          })
          .eq("id", editingCategoryId)
          .select("id, name, slug, created_at, updated_at")
          .single();

        if (error) {
          throw error;
        }

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategoryId ? data : category,
          ),
        );

        setArticles((prev) =>
          prev.map((article) =>
            article.categoryId === editingCategoryId
              ? {
                  ...article,
                  categoryName: data.name,
                }
              : article,
          ),
        );

        alert("Kategori berhasil diperbarui.");
      } else {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: trimmedCategory,
            slug,
          })
          .select("id, name, slug, created_at, updated_at")
          .single();

        if (error) {
          throw error;
        }

        setCategories((prev) => [...prev, data]);
        setForm((prev) => ({
          ...prev,
          categoryId: data.id,
        }));

        alert("Kategori berhasil ditambahkan.");
      }

      resetCategoryForm();
    } catch (error) {
      console.error("Gagal menyimpan kategori:", error);
      alert("Gagal menyimpan kategori ke Supabase.");
    } finally {
      setSavingCategory(false);
    }
  }

  function handleEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setNewCategory(category.name);
    setActiveView("category-form");
  }

  async function handleDeleteCategory(category: Category) {
    const usedByArticles = articles.some(
      (article) => article.categoryId === category.id,
    );

    const confirmed = confirm(
      usedByArticles
        ? "Kategori ini sedang digunakan oleh berita. Jika dihapus, berita terkait akan menjadi Tanpa Kategori. Lanjutkan?"
        : "Yakin ingin menghapus kategori ini?",
    );

    if (!confirmed) return;

    try {
      setDeletingCategoryId(category.id);

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", category.id);

      if (error) {
        throw error;
      }

      setCategories((prev) => prev.filter((item) => item.id !== category.id));

      setArticles((prev) =>
        prev.map((article) =>
          article.categoryId === category.id
            ? {
                ...article,
                categoryId: null,
                categoryName: "Tanpa Kategori",
              }
            : article,
        ),
      );

      if (form.categoryId === category.id) {
        setForm((prev) => ({
          ...prev,
          categoryId:
            categories.find((item) => item.id !== category.id)?.id ?? "",
        }));
      }

      if (categoryFilter === category.id) {
        setCategoryFilter("Semua");
      }

      alert("Kategori berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      alert("Gagal menghapus kategori dari Supabase.");
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleRefreshData() {
    await fetchInitialData();
  }

  async function handleLogout() {
    const confirmed = confirm("Yakin ingin keluar dari admin dashboard?");

    if (!confirmed) return;

    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function getSidebarButtonClass(view: ActiveView) {
    const isActive = activeView === view;

    return `w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
      isActive
        ? "bg-teal-600 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`;
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
          Memeriksa akses admin...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                Admin Dashboard
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Manajemen Berita Kesehatan
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Kelola artikel edukasi, informasi kewaspadaan penyakit, dan
                arahan kesehatan masyarakat berdasarkan risiko wabah atau tren
                penyakit yang sedang meningkat.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600 lg:max-w-sm">
              <p className="font-semibold text-slate-900">Modul Admin Berita</p>
              <p className="mt-1">
                Data sekarang tersimpan langsung di Supabase Database dan gambar
                berita tersimpan di Supabase Storage.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 rounded-3xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-teal-700">
                  Health Scope Admin
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Panel Aksi
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Kelola data berita yang akan tampil di halaman utama aplikasi.
                </p>

                {adminProfile && (
                  <div className="mt-4 rounded-2xl bg-white p-3 text-xs leading-5 text-slate-500">
                    <p className="font-semibold text-slate-900">
                      {adminProfile.name ?? "Admin Health Scope"}
                    </p>
                    <p>{adminProfile.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={openDashboard}
                  className={getSidebarButtonClass("dashboard")}>
                  Dashboard Berita
                </button>

                <button
                  type="button"
                  onClick={openCreateArticle}
                  className={getSidebarButtonClass("article-form")}>
                  Tambah Berita
                </button>

                <button
                  type="button"
                  onClick={openCategoryForm}
                  className={getSidebarButtonClass("category-form")}>
                  Tambah Kategori
                </button>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleRefreshData}
                  className="w-full rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100">
                  Refresh Data
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100">
                  Logout Admin
                </button>

                <p className="text-xs leading-5 text-slate-500">
                  Semua perubahan tersimpan ke Supabase, bukan lagi ke
                  localStorage browser.
                </p>
              </div>
            </section>
          </aside>

          <div className="min-w-0 space-y-6">
            {activeView === "dashboard" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">
                      Total Berita
                    </p>
                    <p className="mt-3 text-4xl font-bold text-slate-900">
                      {articles.length}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                    <p className="text-sm font-semibold text-slate-500">
                      Total Kategori
                    </p>
                    <p className="mt-3 text-4xl font-bold text-teal-600">
                      {categories.length}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm sm:col-span-2 xl:col-span-1">
                    <p className="text-sm font-semibold text-slate-500">
                      Mode Data
                    </p>
                    <p className="mt-3 text-3xl font-bold text-amber-500">
                      Supabase
                    </p>
                  </div>
                </div>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Dashboard Berita
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        Seluruh berita yang ditambahkan akan ditampilkan pada
                        halaman utama aplikasi.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[460px]">
                      <select
                        value={categoryFilter}
                        onChange={(event) =>
                          setCategoryFilter(event.target.value)
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50">
                        <option value="Semua">Semua Kategori</option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(event) =>
                          setSearchKeyword(event.target.value)
                        }
                        placeholder="Cari berita..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                      />
                    </div>
                  </div>

                  {dataLoading ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-semibold text-slate-500">
                      Mengambil data dari Supabase...
                    </div>
                  ) : filteredArticles.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                      <h3 className="font-semibold text-slate-900">
                        Belum ada berita
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Tambahkan berita baru melalui panel aksi di sebelah
                        kiri.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                      {filteredArticles.map((article) => (
                        <article
                          key={article.id}
                          className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                          <div className="relative h-48 overflow-hidden bg-slate-100">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
                                Tidak ada gambar
                              </div>
                            )}

                            <span
                              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${getCategoryClass(
                                article.categoryName,
                              )}`}>
                              {article.categoryName}
                            </span>
                          </div>

                          <div className="p-5">
                            <p className="text-sm font-medium text-slate-400">
                              {formatDate(article.publishedDate)}
                            </p>

                            <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-7 text-slate-900">
                              {article.title}
                            </h3>

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                              {article.description}
                            </p>

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => handleEdit(article)}
                                className="flex-1 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(article)}
                                disabled={deletingArticleId === article.id}
                                className="flex-1 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                                {deletingArticleId === article.id
                                  ? "Menghapus..."
                                  : "Hapus"}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {activeView === "article-form" && (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                    {editingId ? "Mode Edit" : "Form Berita"}
                  </span>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {editingId ? "Edit Berita" : "Tambah Berita Baru"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Isi data berita kesehatan yang akan ditampilkan di halaman
                    publik aplikasi.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kategori
                    </label>

                    <select
                      value={form.categoryId}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          categoryId: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50">
                      <option value="">Pilih kategori</option>

                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tanggal Publikasi
                    </label>

                    <input
                      type="date"
                      value={form.publishedDate}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          publishedDate: event.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Gambar Berita
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleImageChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Format JPG, JPEG, atau PNG. Maksimal 5 MB.
                    </p>

                    {form.imageUrl && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <img
                          src={form.imageUrl}
                          alt="Preview berita"
                          className="h-64 w-full object-cover"
                        />

                        <div className="border-t border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
                          {form.imageName || "Gambar berita"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Judul Berita
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Contoh: Kasus DBD Meningkat di Musim Penghujan"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Deskripsi Berita
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={6}
                      placeholder="Tulis ringkasan atau arahan kewaspadaan penyakit..."
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
                    <button
                      type="submit"
                      disabled={savingArticle}
                      className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {savingArticle
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Tambah Berita"}
                    </button>

                    <button
                      type="button"
                      onClick={openDashboard}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Kembali ke Dashboard
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeView === "category-form" && (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                    Manajemen Kategori
                  </span>

                  <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    {editingCategoryId
                      ? "Edit Kategori Berita"
                      : "Tambah Kategori Berita"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Kategori digunakan untuk mengelompokkan berita berdasarkan
                    jenis penyakit atau topik kewaspadaan.
                  </p>
                </div>

                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nama Kategori
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      placeholder="Contoh: Malaria"
                      className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                    />

                    <button
                      type="button"
                      onClick={handleSaveCategory}
                      disabled={savingCategory}
                      className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {savingCategory
                        ? "Menyimpan..."
                        : editingCategoryId
                          ? "Simpan Kategori"
                          : "Tambah Kategori"}
                    </button>

                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Kategori Tersedia
                  </h3>

                  {categories.length === 0 ? (
                    <div className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      Belum ada kategori.
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                          <span
                            className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getCategoryClass(
                              category.name,
                            )}`}>
                            {category.name}
                          </span>

                          <p className="mt-3 text-xs text-slate-400">
                            Slug: {category.slug}
                          </p>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditCategory(category)}
                              className="flex-1 rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100">
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={deletingCategoryId === category.id}
                              className="flex-1 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60">
                              {deletingCategoryId === category.id
                                ? "Menghapus..."
                                : "Hapus"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
