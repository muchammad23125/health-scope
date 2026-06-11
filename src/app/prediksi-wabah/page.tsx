import RiskMap from "@/components/maps/RiskMap";

export default function PrediksiPage() {

  return (

    <main className="container-page py-10">

      <div className="mb-10">

        <h1 className="text-5xl font-bold">
          Peta Risiko Nasional
        </h1>

        <p className="mt-3 text-slate-600">
          Lihat persebaran risiko penyakit di Indonesia.
        </p>

      </div>

      <RiskMap />

    </main>

  );

}