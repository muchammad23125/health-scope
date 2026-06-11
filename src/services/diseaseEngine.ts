export function predictDisease(
  humidity: number,
  rain: number,
  temperature: number
) {

  let disease = "-";

  if (

    humidity >= 85 &&
    rain >= 5

  ) {

    disease = "DBD";

  }

  else if (

    humidity >= 75 &&
    temperature >= 25

  ) {

    disease = "ISPA";

  }

  else if (

    rain >= 10

  ) {

    disease = "Leptospirosis";

  }

  return disease;

}