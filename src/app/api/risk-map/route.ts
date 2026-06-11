import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

import {
  calculateRisk,
} from "@/services/riskEngine";

import {
  predictDisease,
} from "@/services/diseaseEngine";

/* CACHE */

let cachedRiskMap: any = null;

let cacheTimestamp = 0;

const CACHE_DURATION =
  15 * 60 * 1000;

/* 15 MENIT */

export async function GET() {

  try {

    const now =
      Date.now();

    /* CEK CACHE */

    if (

      cachedRiskMap &&

      now -
      cacheTimestamp <
      CACHE_DURATION

    ) {

      console.log(
        "Using Cache"
      );

      return NextResponse.json({

        success: true,

        cached: true,

        total:
          cachedRiskMap.length,

        data:
          cachedRiskMap,

      });

    }

    const filePath = path.join(

      process.cwd(),

      "public",

      "data",

      "district-centroids.json"

    );

    const centroids =
      JSON.parse(

        fs.readFileSync(

          filePath,

          "utf8"

        )

      );

    const sampleDistricts =
      centroids.slice(
        0,
        519
      );

    const results =
      await Promise.all(

        sampleDistricts.map(

          async (
            district: any
          ) => {

            try {

              const response =
                await fetch(

                  `https://api.open-meteo.com/v1/forecast?latitude=${district.latitude}&longitude=${district.longitude}&current=temperature_2m,relative_humidity_2m,rain&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7`

                );

              const weather =
                await response.json();

              const temperature =

                weather.current
                  ?.temperature_2m ?? 0;

              const humidity =

                weather.current
                  ?.relative_humidity_2m ?? 0;

              const rain =

                weather.current
                  ?.rain ?? 0;

              /* RISIKO HARI INI */

              const risk =
                calculateRisk(

                  humidity,

                  rain,

                  temperature

                );

              /* PREDIKSI PENYAKIT */

              const disease =
                predictDisease(

                  humidity,

                  rain,

                  temperature

                );

              /* RISIKO +3 HARI */

              const day3Rain =

                weather.daily
                  ?.precipitation_sum?.[2] ?? 0;

              const risk3 =
                calculateRisk(

                  humidity,

                  day3Rain,

                  temperature

                );

              /* RISIKO +7 HARI */

              const day7Rain =

                weather.daily
                  ?.precipitation_sum?.[6] ?? 0;

              const risk7 =
                calculateRisk(

                  humidity,

                  day7Rain,

                  temperature

                );

              return {

                shapeName:
                  district.shapeName,

                latitude:
                  district.latitude,

                longitude:
                  district.longitude,

                temperature,

                humidity,

                rain,

                riskScore:
                  risk.score,

                riskStatus:
                  risk.status,

                disease,

                todayStatus:
                  risk.status,

                day3Status:
                  risk3.status,

                day7Status:
                  risk7.status,

                forecast:
                  weather.daily,

              };

            } catch {

              return {

                shapeName:
                  district.shapeName,

                error:
                  true,

              };

            }

          }

        )

      );

    /* UPDATE CACHE */

    cachedRiskMap =
      results;

    cacheTimestamp =
      Date.now();

    console.log(
      "Cache Updated"
    );

    return NextResponse.json({

      success: true,

      cached: false,

      total:
        results.length,

      data:
        results,

    });

  } catch (error) {

    console.error(
      error
    );

    return NextResponse.json(

      {

        success: false,

        error:
          "Failed to generate risk map",

      },

      {

        status: 500,

      }

    );

  }

}