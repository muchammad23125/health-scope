export function calculateRisk(
  humidity: number,
  rain: number,
  temperature: number
) {

  let score = 0;

  /* KELEMBAPAN */

  score +=
    Math.min(
      humidity,
      100
    ) * 0.4;

  /* CURAH HUJAN */

  score +=
    Math.min(
      rain * 5,
      30
    );

  /* SUHU IDEAL PENYEBARAN PENYAKIT */

  if (
    temperature >= 25 &&
    temperature <= 32
  ) {

    score += 20;

  }

  score =
    Math.round(score);

  let status = "safe";

  if (score >= 80) {

    status = "high";

  } else if (
    score >= 50
  ) {

    status = "warning";

  }

  return {
    score,
    status,
  };

}