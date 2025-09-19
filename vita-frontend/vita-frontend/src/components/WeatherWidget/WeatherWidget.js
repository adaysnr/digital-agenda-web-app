"use client";

import { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

const WeatherWidget = () => {
  const [isClient, setIsClient] = useState(false);

  const [city, setCity] = useState("Ankara");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputCity, setInputCity] = useState("");

  // Client-side rendering tamamlandığında çalışacak
  useEffect(() => {
    setIsClient(true);
    // localStorage'dan kayıtlı şehri al
    const savedCity = localStorage.getItem("weather-city");
    if (savedCity) {
      setCity(savedCity);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchWeather(city);
    }
  }, [city, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("weather-city", city);
    }
  }, [city, isClient]);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}&lang=tr`
      );

      if (!response.ok) {
        throw new Error("Hava durumu bilgisi alınamadı.");
      }

      const data = await response.json();
      setWeather(data);
      setError(null);
    } catch (err) {
      setError("Hava durumu bilgisi alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e) => {
    setInputCity(e.target.value);
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
      setInputCity("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="font-bold pb-2 text-[#26282b] dark:text-white">
        Hava Durumu
      </h3>

      {/* Şehir Girişi */}
      <form
        onSubmit={handleCitySubmit}
        className="mb-4 flex flex-col xs:flex-row justify-center items-center gap-2 w-full"
      >
        <input
          type="text"
          value={inputCity}
          onChange={handleCityChange}
          placeholder={`Şehir adı giriniz`}
          className="w-full sm:w-auto text-sm text-center p-2 border-b border-[#26282b] dark:border-white bg-transparent text-[#26282b] dark:text-white focus:outline-none"
        />
        <button
          type="submit"
          className="py-2 w-12 text-[13px] bg-[#36373a] hover:bg-[#4b4c4f] text-white dark:bg-[#f3f3f3] dark:hover:bg-gray-200 dark:text-[#26282b] rounded-md"
        >
          Ara
        </button>
      </form>

      {/* Hava Durumu Bilgisi */}
      {loading ? (
        <p className="text-[#26282b] dark:text-white text-center py-2 text-sm">
          Hava durumu bilgisi yükleniyor...
        </p>
      ) : error ? (
        <p className="text-red-500 text-center py-2 text-sm">{error}</p>
      ) : weather ? (
        <div className="flex flex-col justify-center items-center">
          <div className="text-center">
            {/* Şehir Bilgisi */}
            <p className="text-lg font-bold text-[#26282b] dark:text-white">
              {weather.name}
            </p>

            {/* Sıcaklık */}
            <p className="text-xl font-bold text-[#26282b] dark:text-white">
              {Math.round(weather.main.temp)}°C
            </p>

            {/* Hava Durumu Açıklaması */}
            <p className="text-sm text-[#26282b] dark:text-white">
              {weather.weather[0].description.charAt(0).toUpperCase() +
                weather.weather[0].description.slice(1)}
            </p>
          </div>

          <div className="mt-2 text-center">
            {/* Hissedilen Sıcaklık */}
            <p className="text-xs text-[#26282b] dark:text-white">
              Hissedilen: {Math.round(weather.main.feels_like)}°C
            </p>

            {/* Rüzgar Bilgisi */}
            <p className="text-xs text-[#26282b] dark:text-white">
              Rüzgar: {Math.round(weather.wind.speed)} m/s
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[#26282b] dark:text-white text-center py-2 text-sm">
          Şehir seçin ve hava durumu bilgisi alın.
        </p>
      )}
    </div>
  );
};

export default WeatherWidget;
