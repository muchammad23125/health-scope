export default function BeritaPage() {

  const berita = [
    {
      id: 1,
      kategori: "DBD",
      tanggal: "12 Juni 2026",
      title: "Kasus DBD Meningkat Saat Curah Hujan Tinggi",
      desc: "Peningkatan curah hujan menyebabkan bertambahnya titik genangan air yang berpotensi menjadi sarang nyamuk Aedes aegypti.",
      image:
        "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200&auto=format&fit=crop",
    },

    {
      id: 2,
      kategori: "ISPA",
      tanggal: "11 Juni 2026",
      title: "Perubahan Cuaca Ekstrem Picu Risiko ISPA",
      desc: "Perubahan suhu yang tidak stabil dapat meningkatkan risiko infeksi saluran pernapasan terutama pada anak dan lansia.",
      image:
        "https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=1200&auto=format&fit=crop",
    },

    {
      id: 3,
      kategori: "Leptospirosis",
      tanggal: "10 Juni 2026",
      title: "Waspadai Leptospirosis Setelah Banjir",
      desc: "Kontak langsung dengan air yang terkontaminasi dapat meningkatkan risiko penyebaran penyakit leptospirosis.",
      image:
        "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=1200&auto=format&fit=crop",
    },

    {
      id: 4,
      kategori: "DBD",
      tanggal: "09 Juni 2026",
      title: "Program PSN Dinilai Efektif Menekan DBD",
      desc: "Gerakan pemberantasan sarang nyamuk secara rutin membantu menurunkan angka kasus DBD di beberapa wilayah.",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=1200&auto=format&fit=crop",
    },

    {
      id: 5,
      kategori: "ISPA",
      tanggal: "08 Juni 2026",
      title: "Polusi Udara Tingkatkan Risiko Gangguan Pernapasan",
      desc: "Paparan polusi udara dalam jangka panjang dapat memicu berbagai penyakit pernapasan pada masyarakat.",
      image:
        "https://images.unsplash.com/photo-1600959907703-125ba1374a12?q=80&w=1200&auto=format&fit=crop",
    },

    {
      id: 6,
      kategori: "Leptospirosis",
      tanggal: "07 Juni 2026",
      title: "Edukasi Sanitasi Jadi Kunci Pencegahan",
      desc: "Kebersihan lingkungan dan pengelolaan sampah yang baik membantu menekan penyebaran penyakit berbasis lingkungan.",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <main className="container-page py-10">
      <h1 className="text-5xl font-bold">Berita Kesehatan</h1>

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className="bg-white rounded-3xl shadow overflow-hidden">
            <div className="h-52 bg-slate-200"></div>

            <div className="p-6">
              <h3 className="text-2xl font-bold">Artikel Kesehatan</h3>

              <p className="mt-3 text-slate-500">
                Konten berita dummy untuk testing UI.
              </p>
            </div>
          </div>

        </div>

      </section>

    </main>
  );
}