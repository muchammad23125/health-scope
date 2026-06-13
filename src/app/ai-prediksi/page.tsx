"use client";

import { useEffect, useState } from "react";
import { useUserRisk } from "@/context/UserRiskContext";

import OutbreakPredictionCard from "@/components/prediction/OutbreakPredictionCard";
import ExplainableFactors from "@/components/prediction/ExplainableFactors";
import RecommendationList from "@/components/prediction/RecommendationList";
import AiAdvisoryPanel from "@/components/maps/AiAdvisoryPanel";

type DiseaseType = "DBD" | "ISPA" | "Diare";

export default function AiPrediksiPage() {
    const { userRisk } = useUserRisk();

    const [prediction, setPrediction] = useState<any>(null);

    const [loading, setLoading] = useState(false);

    const [selectedDisease, setSelectedDisease] = useState<DiseaseType>("DBD");

    async function runPrediction(type: DiseaseType) {
        try {
            setLoading(true);

            setSelectedDisease(type);

            if (!userRisk) {
                alert(
                    "Data lokasi dan cuaca belum tersedia. Silakan buka halaman Peta Risiko terlebih dahulu.",
                );

                setLoading(false);

                return;
            }

            const payload = {
                region: userRisk.region,

                disease: type,

                forecastDays: 7,

                temperature: userRisk.temperature,

                humidity: userRisk.humidity,

                rainfall: userRisk.rain,

                riskScore: userRisk.riskScore,

                riskStatus: userRisk.riskStatus,
            };

            const response = await fetch("/api/outbreak-prediction", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(payload),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || "Prediction failed");
            }

            setPrediction(json.data);
        } catch (error) {
            console.error(error);

            alert("Gagal menjalankan prediksi.");
        } finally {
            setLoading(false);
        }
    }

    if (!userRisk) {
        return (
            <main className="min-h-screen bg-slate-50">

                <section
                    className="
          container-page
          py-20
        "
                >

                    <div
                        className="
            max-w-2xl
            mx-auto

            rounded-3xl
            border
            border-amber-200

            bg-amber-50

            p-8

            text-center
          "
                    >

                        <h2
                            className="
              text-2xl
              font-bold
              text-amber-800
            "
                        >
                            Lokasi Belum Aktif
                        </h2>

                        <p
                            className="
              mt-4
              text-slate-700
              leading-7
            "
                        >
                            Untuk menggunakan fitur AI Prediksi,
                            silakan buka halaman
                            <strong> Peta Risiko </strong>
                            terlebih dahulu dan aktifkan GPS perangkat Anda.
                        </p>

                        <p
                            className="
              mt-3
              text-sm
              text-slate-600
            "
                        >
                            Sistem membutuhkan data realtime berupa:
                            lokasi pengguna,
                            suhu,
                            kelembapan,
                            curah hujan,
                            dan skor risiko wilayah
                            agar hasil prediksi wabah lebih akurat.
                        </p>

                    </div>

                </section>

            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <section
                className="
    container-page
    py-10
  "
            >
                {/* HEADER */}
                <div
                    className="
            max-w-2xl
            mx-auto

            rounded-3xl
            border
            border-amber-200

            bg-amber-50

            p-8

            text-center
          "
                >
                    <h2
                        className="
              text-2xl
              font-bold
              text-amber-800
            "
                    >
                        Lokasi Belum Aktif
                    </h2>

                    <p
                        className="
              mt-4
              text-slate-700
              leading-7
            "
                    >
                        Untuk menggunakan fitur AI Prediksi, silakan buka halaman Peta
                        Risiko terlebih dahulu dan aktifkan GPS perangkat Anda. Sistem
                        membutuhkan data realtime berupa lokasi, suhu, kelembapan, curah
                        hujan, dan skor risiko untuk menghasilkan prediksi yang akurat.
                    </p>
                </div>

                {/* CONTENT */}

                <div
                    className="
    bg-white
    rounded-[2rem]
    border
    border-slate-200
    p-6
    shadow-sm
  "
                >
                    {/* DATA REALTIME TERHUBUNG */}

                    <div
                        className="
    mb-6
    rounded-2xl
    border
    border-teal-100
    bg-teal-50
    p-5
  "
                    >
                        <h3
                            className="
      font-bold
      text-slate-900
    "
                        >
                            Data Realtime Terhubung
                        </h3>

                        <p
                            className="
      mt-2
      text-sm
      text-slate-600
      leading-7
    "
                        >
                            Lokasi:
                            <strong> {userRisk.region}</strong>
                            {" • "}
                            Status Risiko:
                            <strong> {userRisk.riskStatus}</strong>
                            {" • "}
                            Risk Score:
                            <strong> {userRisk.riskScore}</strong>
                            {" • "}
                            Prediksi:
                            <strong> {userRisk.diseasePrediction}</strong>
                        </p>
                    </div>

                    {/* PILIH PENYAKIT */}

                    <div
                        className="
      flex
      flex-wrap
      justify-center
      gap-3
      mb-6
    "
                    >
                        {(["DBD", "ISPA", "Diare"] as DiseaseType[]).map((disease) => (
                            <button
                                key={disease}
                                onClick={() => runPrediction(disease)}
                                disabled={loading}
                                className={`

          px-5
          py-3
          rounded-2xl
          font-semibold
          transition

          ${selectedDisease === disease
                                        ? "bg-teal-600 text-white"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }

        `}
                            >
                                Prediksi {disease}
                            </button>
                        ))}
                    </div>

                    {/* LOADING */}

                    {loading && (
                        <div
                            className="
        rounded-2xl
        border
        border-cyan-100
        bg-cyan-50
        p-4
        text-center
        text-cyan-700
      "
                        >
                            Sistem sedang menganalisis data realtime...
                        </div>
                    )}

                    {/* EMPTY STATE */}

                    {!prediction && !loading && (
                        <div
                            className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-5
        text-center
      "
                        >
                            <h3
                                className="
          font-semibold
          text-slate-900
        "
                            >
                                Jalankan Simulasi Prediksi
                            </h3>

                            <p
                                className="
          mt-2
          text-sm
          text-slate-600
        "
                            >
                                Pilih jenis penyakit untuk memulai analisis risiko wabah
                                berdasarkan data realtime lokasi Anda.
                            </p>
                        </div>
                    )}

                    {/* HASIL PREDIKSI */}

                    {prediction && (
                        <div
                            className="
        mt-6
        space-y-6
      "
                        >
                            <div
                                className="
          grid
          gap-6
          xl:grid-cols-2
        "
                            >
                                <div
                                    className="
            space-y-6
          "
                                >
                                    <OutbreakPredictionCard prediction={prediction} />

                                    <RecommendationList
                                        recommendations={prediction.recommendations}
                                    />
                                </div>

                                <ExplainableFactors factors={prediction.explainableFactors} />
                            </div>

                            {prediction.aiAdvisory && (
                                <AiAdvisoryPanel
                                    aiAdvisory={prediction.aiAdvisory}
                                    alertStatus={prediction.alertStatus}
                                />
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
