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
    <main className="bg-[#F8FAFC] min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-[#EAF7F8] via-white to-[#F0FDFA]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-6 py-16 md:py-20">
          <div className="max-w-3xl">
            <span
              className="
                inline-flex
                px-4
                py-2
                rounded-full
                bg-teal-50
                text-teal-700
                text-sm
                font-semibold
              ">
              Informasi Kesehatan Terkini
            </span>

            <h1
              className="
                mt-5

                text-[36px]
                leading-[44px]

                sm:text-[44px]
                sm:leading-[52px]

                md:text-[56px]
                md:leading-[64px]

                font-bold
                text-slate-900
              ">
              Berita Kesehatan
            </h1>

            <p
              className="
                mt-5

                text-slate-600

                text-base
                leading-8

                md:text-lg
                max-w-2xl
              ">
              Ikuti perkembangan terbaru terkait penyakit, kondisi lingkungan,
              serta informasi kesehatan masyarakat yang dapat membantu
              meningkatkan kewaspadaan terhadap risiko wabah.
            </p>
          </div>
        </div>
      </section>

      {/* LIST BERITA */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-6">
          <div
            className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-8
      ">
            {berita.map((item) => (
              <article
                key={item.id}
                className="
            group

            bg-white

            rounded-[30px]

            overflow-hidden

            border
            border-slate-100

            shadow-lg

            hover:-translate-y-2
            hover:shadow-2xl

            transition-all
            duration-300
          ">
                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="
                w-full
                h-[220px]
                object-cover
              "
                  />

                  <div
                    className="
                absolute
                top-4
                left-4

                bg-white/95
                backdrop-blur-md

                px-3
                py-1.5

                rounded-full

                text-xs
                font-bold

                text-[#0F766E]
              ">
                    {item.kategori}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <p className="text-sm text-slate-400">{item.tanggal}</p>

                  <h2
                    className="
                mt-3

                text-[22px]
                leading-[32px]

                font-bold
                text-slate-900

                line-clamp-2
              ">
                    {item.title}
                  </h2>

                  <p
                    className="
                mt-4

                text-slate-600

                leading-7

                line-clamp-3
              ">
                    {item.desc}
                  </p>

                  <button
                    className="
                mt-5

                text-[#0F766E]
                font-semibold

                group-hover:translate-x-1

                transition-all
              ">
                    Baca Selengkapnya →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
