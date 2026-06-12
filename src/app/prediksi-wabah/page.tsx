"use client";

import { useState } from "react";
import RiskMap from "@/components/maps/RiskMap";
import OutbreakPredictionCard from "@/components/prediction/OutbreakPredictionCard";
import ExplainableFactors from "@/components/prediction/ExplainableFactors";
import RecommendationList from "@/components/prediction/RecommendationList";
import AiAdvisoryPanel from "@/components/maps/AiAdvisoryPanel";

const demoPayloads = {
  DBD: {
    region: "Surabaya",
    disease: "DBD",
    forecastDays: 7,
    temperature: 29,
    humidity: 88,
    rainfall: 42,
    windSpeed: 12,
    populationDensity: 9000,
    previousCases: 55,
    searchTrendIndex: 82,
    communityReports: 28,
  },
  ISPA: {
    region: "Surabaya",
    disease: "ISPA",
    forecastDays: 7,
    temperature: 34,
    humidity: 55,
    rainfall: 5,
    windSpeed: 22,
    populationDensity: 9200,
    previousCases: 42,
    searchTrendIndex: 68,
    communityReports: 20,
  },
  Diare: {
    region: "Surabaya",
    disease: "Diare",
    forecastDays: 7,
    temperature: 30,
    humidity: 78,
    rainfall: 28,
    windSpeed: 10,
    populationDensity: 7800,
    previousCases: 25,
    searchTrendIndex: 61,
    communityReports: 16,
  },
};

type DiseaseType = "DBD" | "ISPA" | "Diare";

type UserRiskContext = {
  region: string;
  province?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rain: number;
  riskScore: number;
  riskStatus: string;
  diseasePrediction: string;
  riskPeriod: string;
};

export default function PrediksiPage() {
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType>("DBD");
  const [loading, setLoading] = useState(false);
  const [userRiskContext, setUserRiskContext] =
    useState<UserRiskContext | null>(null);

  async function runPrediction(type: DiseaseType) {
    try {
      setLoading(true);
      setSelectedDisease(type);

      const basePayload = demoPayloads[type];

      const payload = {
        ...basePayload,
        region: userRiskContext?.region ?? basePayload.region,
        temperature: userRiskContext?.temperature ?? basePayload.temperature,
        humidity: userRiskContext?.humidity ?? basePayload.humidity,
        rainfall: userRiskContext?.rain ?? basePayload.rainfall,
        userLatitude: userRiskContext?.latitude,
        userLongitude: userRiskContext?.longitude,
        userRiskScore: userRiskContext?.riskScore,
        userRiskStatus: userRiskContext?.riskStatus,
        userDiseasePrediction: userRiskContext?.diseasePrediction,
        userRiskPeriod: userRiskContext?.riskPeriod,
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
        throw new Error(json.message || "Gagal menjalankan prediksi.");
      }

      setPrediction(json.data);
    } catch (error) {
      console.error(error);
      alert("Gagal menjalankan prediksi risiko wabah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="container-page py-8 lg:py-10">
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            Prediksi Wabah Nasional
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Peta Risiko Nasional
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Lihat persebaran risiko penyakit di Indonesia melalui peta
            interaktif berbasis GIS, dilengkapi prediksi risiko wabah 7-14 hari
            ke depan berbasis data iklim, riwayat penyakit, tren pencarian, dan
            kerentanan wilayah.
          </p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
          <RiskMap onUserRiskChange={setUserRiskContext} />
        </div>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                AI-Based Early Warning System
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Analisis Prediksi Risiko Wabah
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Sistem menganalisis risiko penyakit berdasarkan faktor iklim,
                riwayat kasus, tren pencarian masyarakat, laporan partisipatif,
                dan tingkat kerentanan wilayah. Hasilnya berupa status
                kewaspadaan, skor risiko, faktor penyebab, serta rekomendasi
                tindakan.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(["DBD", "ISPA", "Diare"] as DiseaseType[]).map((disease) => (
                <button
                  key={disease}
                  onClick={() => runPrediction(disease)}
                  disabled={loading}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedDisease === disease
                      ? "bg-teal-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}>
                  Prediksi {disease}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-medium text-cyan-700">
              Sistem sedang menganalisis data risiko wabah...
            </div>
          )}

          {!prediction && !loading && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">
                Jalankan simulasi prediksi
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pilih salah satu jenis penyakit untuk melihat bagaimana sistem
                menghasilkan prediksi risiko, tingkat kerentanan, catatan
                kewaspadaan, dan rekomendasi tindakan.
              </p>
            </div>
          )}

          {prediction && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-6">
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
        </section>
      </section>
    </main>
  );
}
