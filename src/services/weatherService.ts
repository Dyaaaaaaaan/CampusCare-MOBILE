import { WeatherApiResponse, WeatherData } from "@/types/api";

const API_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-7.9214&longitude=112.5969&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";

// Custom async function menggunakan async/await
export async function getCampusWeather(): Promise<WeatherData> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Gagal mengambil data cuaca");
  }

  const result: WeatherApiResponse = await response.json();

  const weather: WeatherData = {
    temperature: result.current.temperature_2m,
    humidity: result.current.relative_humidity_2m,
    feelsLike: result.current.apparent_temperature,
    weatherCode: result.current.weather_code,
    windSpeed: result.current.wind_speed_10m,
  };

  return weather;
}

// Menggunakan Promise chaining dan validasi data

export function getWeatherWithPromise(): Promise<WeatherData> {
  return getCampusWeather()
    .then((data) => validateWeatherData(data))
    .then((data) => {
      return Promise.resolve(data);
    })
    .catch((error: unknown) => {
      return Promise.reject(error);
    });
}

// Validasi data menggunakan Promise.resolve() dan Promise.reject()
export function validateWeatherData(data: WeatherData): Promise<WeatherData> {
  if (
    Number.isFinite(data.temperature) &&
    Number.isFinite(data.humidity) &&
    Number.isFinite(data.windSpeed)
  ) {
    return Promise.resolve(data);
  }

  return Promise.reject(new Error("Data cuaca tidak valid"));
}
