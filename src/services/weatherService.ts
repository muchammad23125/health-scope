export async function fetchWeatherData(
  latitude: number,
  longitude: number
) {

  const response =
    await fetch(

      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain`

    );

  const data =
    await response.json();

  return {

    temperature:
      data.current
        ?.temperature_2m ?? 0,

    humidity:
      data.current
        ?.relative_humidity_2m ?? 0,

    rain:
      data.current
        ?.rain ?? 0,

  };

}