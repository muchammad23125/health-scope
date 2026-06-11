export function getRecommendations(
  diseasePrediction: string
) {

  const recs: string[] = [];

  switch (
    diseasePrediction
  ) {

    case "DBD":

      recs.push(
        "Hindari genangan air"
      );

      recs.push(
        "Lakukan 3M Plus"
      );

      recs.push(
        "Gunakan lotion anti nyamuk"
      );

      break;

    case "ISPA":

      recs.push(
        "Gunakan masker saat hujan"
      );

      recs.push(
        "Hindari udara lembap"
      );

      recs.push(
        "Perbanyak minum air putih"
      );

      break;

    case "Leptospirosis":

      recs.push(
        "Hindari banjir dan genangan"
      );

      recs.push(
        "Gunakan alas kaki tertutup"
      );

      recs.push(
        "Jaga kebersihan lingkungan"
      );

      break;

    default:

      recs.push(
        "Pertahankan pola hidup sehat"
      );

      recs.push(
        "Pantau kondisi cuaca"
      );

  }

  return recs;

}