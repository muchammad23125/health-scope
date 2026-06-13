import { NextResponse } from "next/server";
import { predictOutbreakRisk } from "@/lib/outbreak-risk";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      "region",
      "disease",
      "forecastDays",
      "temperature",
      "humidity",
      "rainfall",
    ];

    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        return NextResponse.json(
          { message: `Field ${field} wajib diisi.` },
          { status: 400 },
        );
      }
    }

    const result = predictOutbreakRisk({
      region: String(body.region),

      disease: body.disease,

      forecastDays: Number(body.forecastDays) === 14 ? 14 : 7,

      temperature: Number(body.temperature),

      humidity: Number(body.humidity),

      rainfall: Number(body.rainfall),

      riskScore: Number(body.riskScore),

      riskStatus: String(body.riskStatus),
    });

    return NextResponse.json({
      message: "Prediksi risiko wabah berhasil.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal memproses prediksi risiko wabah." },
      { status: 500 },
    );
  }
}
