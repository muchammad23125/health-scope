"use client";

import { useState } from "react";

import {
  Bug,
  Rat,
  Wind,
  Droplets,
  Thermometer,
  Brain,
  Eye,
  PersonStanding,
  ShieldCheck,
  CircleDot,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  Activity,
} from "lucide-react";

/* =======================================
   DATA PENYAKIT
======================================= */

const penyakitData = {
  // DBD
  dbd: {
    nama: "DBD",

    title: "Demam Berdarah Dengue (DBD)",

    description:
      "DBD adalah penyakit yang disebabkan oleh virus dengue dan ditularkan melalui gigitan nyamuk Aedes aegypti.",

    section1Title: "Apa Itu DBD?",

    section1Content: [
      "Demam Berdarah Dengue (DBD) adalah penyakit infeksi yang disebabkan oleh virus dengue dan ditularkan melalui gigitan nyamuk Aedes aegypti maupun Aedes albopictus yang telah terinfeksi.",

      "Penyakit ini banyak ditemukan di wilayah tropis dan subtropis termasuk Indonesia. Risiko penularan meningkat saat musim hujan karena banyak genangan air yang menjadi tempat berkembang biaknya nyamuk.",

      "Gejala biasanya muncul dalam waktu 4–10 hari setelah gigitan nyamuk yang membawa virus dengue. Jika tidak ditangani dengan baik, DBD dapat menyebabkan komplikasi serius seperti perdarahan, syok dengue, hingga kematian.",
    ],

    symptoms: [
      {
        icon: "thermometer",
        label: "Demam Tinggi",
      },

      {
        icon: "brain",
        label: "Sakit Kepala",
      },

      {
        icon: "eye",
        label: "Nyeri Mata",
      },

      {
        icon: "shield",
        label: "Mual & Muntah",
      },

      {
        icon: "person",
        label: "Nyeri Otot",
      },

      {
        icon: "circle",
        label: "Bintik Merah",
      },
    ],

    causeDescription:
      "DBD disebabkan oleh infeksi virus dengue yang masuk ke dalam tubuh manusia melalui gigitan nyamuk Aedes yang telah terinfeksi.",

    causeFlow: [
      {
        icon: "bug",
        title: "Nyamuk Aedes",
      },

      {
        icon: "virus",
        title: "Virus Dengue",
      },

      {
        icon: "person",
        title: "Masuk ke Tubuh",
      },

      {
        icon: "heart",
        title: "Menimbulkan DBD",
      },
    ],

    prevention: [
      "Menguras tempat penampungan air secara rutin.",
      "Menutup rapat wadah penyimpanan air.",
      "Mendaur ulang barang bekas yang berpotensi menampung air.",
      "Menggunakan lotion anti nyamuk.",
      "Memasang kawat kasa pada ventilasi rumah.",
      "Menjaga kebersihan lingkungan sekitar.",
    ],

    warning: [
      "Demam tinggi lebih dari 3 hari.",
      "Muntah terus menerus.",
      "Perdarahan pada gusi atau hidung.",
      "Tubuh sangat lemas dan sulit beraktivitas.",
    ],

    facts: [
      "DBD ditularkan melalui gigitan nyamuk Aedes.",
      "Risiko meningkat saat musim hujan.",
      "Seseorang dapat terkena DBD lebih dari satu kali.",
      "Belum ada obat khusus untuk membunuh virus dengue.",
      "Pencegahan sarang nyamuk merupakan langkah paling efektif.",
    ],
  },

  // ISPA
  ispa: {
    nama: "ISPA",

    title: "Infeksi Saluran Pernapasan Akut (ISPA)",

    description:
      "ISPA adalah infeksi yang menyerang saluran pernapasan bagian atas maupun bawah yang dapat disebabkan oleh virus, bakteri, atau faktor lingkungan.",

    section1Title: "Apa Itu ISPA?",

    section1Content: [
      "Infeksi Saluran Pernapasan Akut atau ISPA merupakan penyakit yang menyerang sistem pernapasan seperti hidung, tenggorokan, hingga paru-paru.",

      "ISPA menjadi salah satu penyakit yang paling sering terjadi terutama pada anak-anak, lansia, dan individu dengan daya tahan tubuh yang rendah.",

      "Penyakit ini dapat menular melalui percikan air liur saat batuk atau bersin, serta kontak dengan benda yang terkontaminasi virus atau bakteri.",
    ],

    symptoms: [
      {
        icon: "thermometer",
        label: "Demam",
      },

      {
        icon: "lung",
        label: "Batuk",
      },

      {
        icon: "lung",
        label: "Pilek",
      },

      {
        icon: "shield",
        label: "Sakit Tenggorokan",
      },

      {
        icon: "lung",
        label: "Sesak Napas",
      },

      {
        icon: "lung",
        label: "Hidung Tersumbat",
      },
    ],

    causeDescription:
      "ISPA dapat disebabkan oleh berbagai mikroorganisme seperti virus dan bakteri yang menyerang sistem pernapasan manusia.",

    causeFlow: [
      {
        icon: "virus",
        title: "Virus / Bakteri",
      },

      {
        icon: "wind",
        title: "Saluran Nafas",
      },

      {
        icon: "lungs",
        title: "Infeksi",
      },

      {
        icon: "heart",
        title: "Gejala ISPA",
      },
    ],

    prevention: [
      "Menggunakan masker saat berada di lingkungan berdebu.",
      "Mencuci tangan secara rutin.",
      "Menghindari kontak dengan penderita ISPA.",
      "Mengonsumsi makanan bergizi.",
      "Tidak merokok.",
      "Menjaga ventilasi rumah tetap baik.",
    ],

    warning: [
      "Sesak napas berat.",
      "Demam tinggi yang tidak membaik.",
      "Batuk berkepanjangan.",
      "Kesulitan bernapas saat beraktivitas.",
    ],

    facts: [
      "ISPA termasuk penyakit yang paling sering terjadi di Indonesia.",
      "Anak-anak lebih rentan terkena ISPA.",
      "Polusi udara menjadi salah satu faktor risiko utama.",
      "Sebagian besar kasus ISPA disebabkan oleh virus.",
      "Kebersihan tangan dapat membantu mencegah penularan.",
    ],
  },

  // Leptospirosis
  leptospirosis: {
    nama: "Leptospirosis",

    title: "Leptospirosis",

    description:
      "Leptospirosis adalah penyakit infeksi yang disebabkan oleh bakteri Leptospira dan dapat menular melalui air atau tanah yang terkontaminasi urin hewan.",

    section1Title: "Apa Itu Leptospirosis?",

    section1Content: [
      "Leptospirosis merupakan penyakit yang disebabkan oleh bakteri Leptospira dan dapat menyerang manusia maupun hewan.",

      "Penularan biasanya terjadi ketika seseorang melakukan kontak dengan air, lumpur, atau tanah yang telah terkontaminasi urin hewan yang terinfeksi.",

      "Penyakit ini sering muncul setelah banjir dan dapat menyebabkan komplikasi serius pada ginjal, hati, maupun paru-paru.",
    ],

    symptoms: [
      {
        icon: "thermometer",
        label: "Demam",
      },

      {
        icon: "person",
        label: "Nyeri Otot",
      },

      {
        icon: "eye",
        label: "Mata Merah",
      },

      {
        icon: "brain",
        label: "Sakit Kepala",
      },

      {
        icon: "shield",
        label: "Mual",
      },

      {
        icon: "circle",
        label: "Kulit Menguning",
      },
    ],

    causeDescription:
      "Leptospirosis disebabkan oleh bakteri Leptospira yang masuk ke dalam tubuh melalui luka pada kulit atau selaput lendir.",

    causeFlow: [
      {
        icon: "rat",
        title: "Hewan Terinfeksi",
      },

      {
        icon: "droplets",
        title: "Air Tercemar",
      },

      {
        icon: "person",
        title: "Masuk ke Tubuh",
      },

      {
        icon: "heart",
        title: "Leptospirosis",
      },
    ],

    prevention: [
      "Menggunakan alas kaki saat berada di area banjir.",
      "Menghindari kontak langsung dengan air yang tercemar.",
      "Menjaga kebersihan lingkungan.",
      "Mengendalikan populasi tikus.",
      "Menggunakan sarung tangan saat membersihkan saluran air.",
      "Mencuci tubuh setelah kontak dengan air banjir.",
    ],

    warning: [
      "Demam tinggi yang tidak membaik.",
      "Mata menguning.",
      "Nyeri otot berat.",
      "Gangguan pernapasan.",
    ],

    facts: [
      "Leptospirosis sering meningkat setelah banjir.",
      "Tikus merupakan sumber penularan utama.",
      "Bakteri dapat masuk melalui luka kecil pada kulit.",
      "Penyakit ini dapat menyerang ginjal dan hati.",
      "Deteksi dini membantu mencegah komplikasi berat.",
    ],
  },
};

export default function EdukasiPage() {
  const [selectedDisease, setSelectedDisease] =
    useState<keyof typeof penyakitData>("dbd");

  const [openSection, setOpenSection] = useState<number | null>(1);

  const disease = penyakitData[selectedDisease];

  const diseaseIcons = {
    dbd: <Bug className="w-14 h-14 text-[#0F766E]" />,

    ispa: <Wind className="w-14 h-14 text-[#0F766E]" />,

    leptospirosis: <Rat className="w-14 h-14 text-[#0F766E]" />,
  } as const;

  const symptomIcons = {
    thermometer: <Thermometer className="w-8 h-8 text-red-500" />,

    brain: <Brain className="w-8 h-8 text-indigo-500" />,

    eye: <Eye className="w-8 h-8 text-sky-500" />,

    shield: <ShieldCheck className="w-8 h-8 text-amber-500" />,

    person: <PersonStanding className="w-8 h-8 text-emerald-600" />,

    circle: <CircleDot className="w-8 h-8 text-red-600" />,

    lung: <Wind className="w-8 h-8 text-cyan-600" />,

    water: <Droplets className="w-8 h-8 text-blue-500" />,
  } as const;

  const causeFlowIcons = {
    bug: <Bug className="w-8 h-8 text-emerald-600" />,

    virus: <ShieldCheck className="w-8 h-8 text-red-500" />,

    person: <PersonStanding className="w-8 h-8 text-sky-500" />,

    heart: <HeartPulse className="w-8 h-8 text-pink-500" />,

    wind: <Wind className="w-8 h-8 text-cyan-500" />,

    lungs: <Activity className="w-8 h-8 text-indigo-500" />,

    droplets: <Droplets className="w-8 h-8 text-blue-500" />,

    rat: <Rat className="w-8 h-8 text-amber-600" />,
  } as const;

  const diseaseList = [
    {
      key: "dbd",
      label: "DBD",
      icon: <Bug className="w-6 h-6" />,
    },

    {
      key: "ispa",
      label: "ISPA",
      icon: <Wind className="w-6 h-6" />,
    },

    {
      key: "leptospirosis",
      label: "Leptospirosis",
      icon: <Rat className="w-6 h-6" />,
    },
  ] as const;

  return (
    <main className="bg-[#F7F9FB] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div>
          <h1
            className="
      text-[36px]
      leading-[44px]

      sm:text-[44px]
      sm:leading-[52px]

      md:text-[50px]
      md:leading-[58px]

      lg:text-[56px]
      lg:leading-[64px]

      font-bold
      text-slate-900
    ">
            Edukasi
          </h1>

          <p
            className="
      mt-4

      text-[15px]
      leading-7

      sm:text-base

      md:text-lg
      md:leading-8

      text-slate-500

      max-w-full
      sm:max-w-lg
      lg:max-w-xl
    ">
            Pelajari informasi dasar tentang berbagai penyakit untuk menjaga
            kesehatan diri dan keluarga.
          </p>
        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 mt-10">
          {/* SIDEBAR */}
          <aside className="bg-white border border-slate-200 rounded-3xl p-5 h-fit">
            <h3 className="font-bold text-xl text-slate-900 mb-6">
              Semua Penyakit
            </h3>

            <div className="space-y-3">
              {diseaseList.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setSelectedDisease(item.key as keyof typeof penyakitData);

                    setOpenSection(1);
                  }}
                  className={`
          w-full
          flex
          items-center
          gap-4
          px-5
          py-5
          rounded-2xl
          transition-all
          duration-300
          text-left

          ${
            selectedDisease === item.key
              ? `
                bg-[#EDF8F5]
                text-[#0F766E]
                font-semibold
                border
                border-[#CFEFE4]
              `
              : `
                text-slate-700
                hover:bg-slate-50
                border
                border-transparent
              `
          }
        `}>
                  <div className="shrink-0">{item.icon}</div>

                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* CONTENT AREA */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8">
            {/* TITLE */}
            <div className="flex items-center gap-6">
              <div
                className="
    w-28
    h-28
    rounded-full
    bg-[#EDF8F5]
    flex
    items-center
    justify-center
  ">
                {diseaseIcons[selectedDisease]}
              </div>

              <div>
                <h2
                  className="
      text-[48px]
      leading-[56px]
      font-bold
      text-slate-900
    ">
                  {disease.title}
                </h2>

                <p
                  className="
      mt-3
      text-lg
      text-slate-600
      max-w-3xl
    ">
                  {disease.description}
                </p>
              </div>
            </div>

            {/* SECTION 1 */}
            <div className="mt-10 border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === 1 ? null : 1)}
                className="
      w-full
      flex
      items-center
      justify-between
      p-6
      text-left
      bg-white
    ">
                <div className="flex items-center gap-4">
                  <div
                    className="
        w-9
        h-9
        rounded-full
        bg-[#0F9D73]
        text-white
        font-bold
        flex
        items-center
        justify-center
      ">
                    1
                  </div>

                  <h3 className="text-2xl font-bold">
                    {disease.section1Title}
                  </h3>
                </div>

                <ChevronDown
                  className={`
        transition-all
        duration-300
        ${openSection === 1 ? "rotate-180" : ""}
      `}
                />
              </button>

              {openSection === 1 && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  <div
                    className="
        mt-6
        space-y-4
        text-slate-600
        leading-8
      ">
                    {disease.section1Content.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2 */}
            <div className="mt-5 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div
                  className="
      w-9
      h-9
      rounded-full
      bg-[#0F9D73]
      text-white
      font-bold
      flex
      items-center
      justify-center
    ">
                  2
                </div>

                <h3 className="text-2xl font-bold">Gejala Umum</h3>
              </div>

              <div
                className="
    grid
    grid-cols-2
    md:grid-cols-3
    lg:grid-cols-6
    gap-5
    mt-8
  ">
                {disease.symptoms.map((item) => (
                  <div
                    key={item.label}
                    className="
          text-center
          p-4
          rounded-2xl
          bg-[#FAFCFB]
          border
          border-[#E6F4EF]
        ">
                    <div
                      className="
    w-20
    h-20
    rounded-full
    bg-white
    border
    border-[#D7EFE7]
    mx-auto
    flex
    items-center
    justify-center
    shadow-sm
  ">
                      {symptomIcons[item.icon as keyof typeof symptomIcons]}
                    </div>

                    <p
                      className="
          mt-4
          text-sm
          font-medium
          text-slate-700
          leading-5
        ">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="mt-5 border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === 3 ? null : 3)}
                className="
      w-full
      flex
      items-center
      justify-between
      p-6
      text-left
      bg-white
    ">
                <div className="flex items-center gap-4">
                  <div
                    className="
        w-9
        h-9
        rounded-full
        bg-[#0F9D73]
        text-white
        font-bold
        flex
        items-center
        justify-center
      ">
                    3
                  </div>

                  <h3 className="text-2xl font-bold">Penyebab</h3>
                </div>

                <ChevronDown
                  className={`
        transition-all
        duration-300
        ${openSection === 3 ? "rotate-180" : ""}
      `}
                />
              </button>

              {openSection === 3 && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  <p
                    className="
      mt-6
      text-slate-600
      leading-8
    ">
                    {disease.causeDescription}
                  </p>

                  <div
                    className="
    mt-8
    flex
    flex-col
    md:flex-row
    items-center
    justify-center
    gap-4
    ">
                    {disease.causeFlow.map((item, index) => (
                      <div
                        key={item.title}
                        className="
      flex
      items-center
      gap-4
    ">
                        <div
                          className="
        bg-white
        border
        border-slate-200
        rounded-2xl
        px-5
        py-4
        min-w-[140px]
        text-center
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
      ">
                          <div
                            className="
          w-14
          h-14
          rounded-full
          bg-[#EDF8F5]
          flex
          items-center
          justify-center
          mx-auto
        ">
                            {
                              causeFlowIcons[
                                item.icon as keyof typeof causeFlowIcons
                              ]
                            }
                          </div>

                          <p
                            className="
          mt-3
          text-sm
          font-semibold
          text-slate-800
          leading-5
        ">
                            {item.title}
                          </p>
                        </div>

                        {index < disease.causeFlow.length - 1 && (
                          <div
                            className="
          hidden
          md:flex
          text-slate-400
          text-3xl
        ">
                            →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4 */}
            <div className="mt-5 border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === 4 ? null : 4)}
                className="
      w-full
      flex
      items-center
      justify-between
      p-6
      text-left
      bg-white
    ">
                <div className="flex items-center gap-4">
                  <div
                    className="
          w-9
          h-9
          rounded-full
          bg-[#0F9D73]
          text-white
          font-bold
          flex
          items-center
          justify-center
        ">
                    4
                  </div>

                  <h3 className="text-2xl font-bold">Cara Pencegahan</h3>
                </div>

                <ChevronDown
                  className={`
        transition-all
        duration-300
        ${openSection === 4 ? "rotate-180" : ""}
      `}
                />
              </button>

              {openSection === 4 && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  <div
                    className="
          grid
          md:grid-cols-2
          gap-4
          mt-6
        ">
                    {disease.prevention.map((item) => (
                      <div
                        key={item}
                        className="
              group
              flex
              items-center
              gap-4
              p-5
              bg-white
              border
              border-slate-200
              rounded-2xl
              hover:border-[#0F9D73]
              hover:shadow-md
              transition-all
              duration-300
            ">
                        <div
                          className="
                w-12
                h-12
                rounded-xl
                bg-[#EDF8F5]
                flex
                items-center
                justify-center
                shrink-0
                group-hover:bg-[#0F9D73]
                transition-all
                duration-300
              ">
                          <CheckCircle2
                            className="
                  w-6
                  h-6
                  text-[#0F9D73]
                  group-hover:text-white
                  transition-all
                  duration-300
                "
                          />
                        </div>

                        <div className="flex-1">
                          <p
                            className="
                  text-slate-700
                  leading-6
                  font-medium
                ">
                            {item}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5 */}
            <div
              className="
    mt-5
    rounded-2xl
    bg-red-50
    border
    border-red-100
    p-6
  ">
              <div className="flex items-center gap-4">
                <div
                  className="
        w-9
        h-9
        rounded-full
        bg-red-500
        text-white
        font-bold
        flex
        items-center
        justify-center
      ">
                  5
                </div>

                <h3
                  className="
        text-2xl
        font-bold
        text-red-600
      ">
                  Kapan Harus ke Fasilitas Kesehatan?
                </h3>
              </div>

              <p
                className="
      mt-5
      text-slate-600
      leading-7
    ">
                Segera periksa ke fasilitas kesehatan jika mengalami:
              </p>

              <div
                className="
      grid
      md:grid-cols-2
      lg:grid-cols-4
      gap-4
      mt-6
    ">
                {disease.warning.map((item) => (
                  <div
                    key={item}
                    className="
          bg-white
          border
          border-red-100
          rounded-2xl
          p-4
          flex
          items-center
          gap-3
          hover:shadow-md
          transition-all
          duration-300
        ">
                    <div
                      className="
            w-10
            h-10
            rounded-xl
            bg-red-50
            flex
            items-center
            justify-center
            shrink-0
          ">
                      <AlertTriangle
                        className="
              w-5
              h-5
              text-red-500
            "
                      />
                    </div>

                    <span
                      className="
            text-sm
            font-medium
            text-slate-700
            leading-5
          ">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6 */}
            <div className="mt-5 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div
                  className="
        w-9
        h-9
        rounded-full
        bg-[#0F9D73]
        text-white
        font-bold
        flex
        items-center
        justify-center
      ">
                  6
                </div>

                <h3 className="text-2xl font-bold">Fakta Singkat</h3>
              </div>

              <ul
                className="
      mt-5
      list-disc
      pl-5
      text-slate-600
      space-y-3
      leading-7
    ">
                {disease.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
