export interface WeatherApiResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  feelsLike: number;
  weatherCode: number;
  windSpeed: number;
}
