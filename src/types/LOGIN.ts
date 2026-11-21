export interface WeatherApiResponse {
  login: {
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  };
}
