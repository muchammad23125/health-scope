"use client";

import { useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";
import { useUserRisk } from "@/context/UserRiskContext";

import { calculateRisk } from "@/services/riskEngine";
import { predictDisease } from "@/services/diseaseEngine";
import { fetchWeatherData } from "@/services/weatherService";

import Map, {
  NavigationControl,
  Source,
  Layer,
  Marker,
  Popup,
} from "react-map-gl/maplibre";

type UserRiskContext = {
  region: string;
  province?: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rain: number;
  riskScore: number;
  riskStatus: string;
  diseasePrediction: string;
  riskPeriod: string;
};

type RiskMapProps = {
  onUserRiskChange?: (data: UserRiskContext) => void;
};

export default function RiskMap({ onUserRiskChange }: RiskMapProps) {
  const [geojson, setGeojson] = useState<any>(null);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  const [userLocation, setUserLocation] = useState<any>(null);
  const [userArea, setUserArea] = useState<any>(null);

  const [weatherData, setWeatherData] = useState<any>(null);
  const [riskStatus, setRiskStatus] = useState("safe");
  const [riskScore, setRiskScore] = useState(0);
  const [diseasePrediction, setDiseasePrediction] = useState("-");
  const [riskPeriod, setRiskPeriod] = useState("-");

  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showAreaPanel, setShowAreaPanel] = useState(false);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);

  const [dynamicGeojson, setDynamicGeojson] = useState<any>(null);

  const [riskMapData, setRiskMapData] = useState<any[]>([]);
  const [predictionList, setPredictionList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [heatmapSummary, setHeatmapSummary] = useState({
    safe: 0,
    warning: 0,
    high: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [todaySummary, setTodaySummary] = useState({
    high: 0,
    warning: 0,
    safe: 0,
  });

  const [topRiskAreas, setTopRiskAreas] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [mapSize, setMapSize] = useState({
    width: 0,
    height: 0,
  });

  const mapRef = useRef<any>(null);
  const hasFocusedUser = useRef(false);

  // Tambahan koordinat marker AI yang menggunakan lokasi user jika tersedia, atau default jika tidak ada

  // useEffect(() => {
  //   if (!prediction || !mapRef.current) return;

  //   mapRef.current.flyTo({
  //     center: [AI_MARKER_COORDINATE.longitude, AI_MARKER_COORDINATE.latitude],
  //     zoom: 9,
  //     duration: 1500,
  //   });

  //   setShowAiPopup(true);
  // }, [prediction]);
  /* LOAD GEOJSON + INITIAL OUTBREAK DATA */
  useEffect(() => {
    fetch("/data/indonesia.geojson")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((feature: any) => {
          feature.properties.status = "safe";
          feature.properties.rainfall = 0;
          feature.properties.disease = "-";
          feature.properties.province = "-";
          feature.properties.period = "7-14 Hari";
        });

        setGeojson(data);
        setDynamicGeojson(JSON.parse(JSON.stringify(data)));

        setTimeout(() => {
          mapRef.current?.fitBounds(
            [
              [95, -11],
              [141, 6],
            ],
            {
              padding: 20,
              duration: 1200,
            },
          );
        }, 500);
      });
  }, []);

  /* LOAD RISK MAP API + AUTO REFRESH */
  useEffect(() => {
    const loadRiskMap = async () => {
      try {
        const response = await fetch("/api/risk-map");
        const result = await response.json();

        if (result.success) {
          setRiskMapData(result.data);

          setPredictionList(
            result.data
              .filter((item: any) => !item.error)
              .sort((a: any, b: any) => b.riskScore - a.riskScore),
          );

          const high = result.data.filter(
            (item: any) => item.riskStatus === "high",
          ).length;

          const warning = result.data.filter(
            (item: any) => item.riskStatus === "warning",
          ).length;

          const safe = result.data.filter(
            (item: any) => item.riskStatus === "safe",
          ).length;

          setTodaySummary({
            high,
            warning,
            safe,
          });

          setHeatmapSummary({
            high,
            warning,
            safe,
          });

          setLastUpdate(new Date());

          console.log("Risk Map API Loaded:", result.data.length);
          console.log("Today Summary:", { high, warning, safe });
          console.log(
            "Prediction List:",
            result.data.filter((item: any) => !item.error).slice(0, 5),
          );
        }
      } catch (error) {
        console.error("Risk Map API Error:", error);
      }
    };

    loadRiskMap();

    const interval = setInterval(loadRiskMap, 15 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* UPDATE WARNA PETA DARI API */
  useEffect(() => {
    if (!geojson || !riskMapData.length) {
      return;
    }

    const updatedGeojson = JSON.parse(JSON.stringify(geojson));

    updatedGeojson.features.forEach((feature: any) => {
      const riskData = riskMapData.find(
        (item: any) => item.shapeName === feature.properties?.shapeName,
      );

      if (riskData) {
        feature.properties.status = riskData.riskStatus;
        feature.properties.riskScore = riskData.riskScore;
        feature.properties.disease = riskData.disease;
      }
    });

    setDynamicGeojson(updatedGeojson);

    console.log("GeoJSON Updated:", updatedGeojson.features.length);
  }, [geojson, riskMapData]);

  /* TOP 10 RISIKO NASIONAL */
  useEffect(() => {
    if (!riskMapData.length) {
      return;
    }

    const topAreas = [...riskMapData]
      .filter((item) => item.riskScore >= 50)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    setTopRiskAreas(topAreas);

    console.log("Top Risk Areas:", topAreas);
  }, [riskMapData]);

  /* RESET PAGINATION SAAT SEARCH */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  const filteredPredictionList = predictionList.filter((item: any) =>
    item.shapeName?.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredPredictionList.length / ITEMS_PER_PAGE);

  const paginatedPredictionList = filteredPredictionList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* RESPONSIVE MAP SIZE */
  useEffect(() => {
    const updateSize = () => {
      setMapSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  /* GEOLOCATION USER */
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation tidak didukung");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation({
          latitude,
          longitude,
        });

        console.log("Realtime Location:", latitude, longitude);

        if (!hasFocusedUser.current) {
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 9,
            duration: 2500,
          });

          hasFocusedUser.current = true;
        }
      },
      (error) => {
        console.error("Gagal mendapatkan lokasi:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  /* OPEN METEO */
  useEffect(() => {
    if (!userLocation) return;

    const loadWeather = async () => {
      try {
        const data = await fetchWeatherData(
          userLocation.latitude,
          userLocation.longitude,
        );

        setWeatherData(data);

        console.log("Weather Data:", data);
      } catch (error) {
        console.error("Open Meteo Error:", error);
      }
    };

    loadWeather();
  }, [userLocation]);

  /* RISK ENGINE */
  useEffect(() => {
    if (!weatherData) return;

    const humidity = weatherData.humidity ?? 0;
    const rain = weatherData.rain ?? 0;
    const temperature = weatherData.temperature ?? 0;

    const result = calculateRisk(humidity, rain, temperature);

    setRiskScore(result.score);
    setRiskStatus(result.status);

    console.log("Risk Score:", result.score);
    console.log("Risk Status:", result.status);
  }, [weatherData]);

  /* DISEASE PREDICTION */
  useEffect(() => {
    if (!weatherData) return;

    const humidity = weatherData.humidity ?? 0;
    const rain = weatherData.rain ?? 0;
    const temperature = weatherData.temperature ?? 0;

    const disease = predictDisease(humidity, rain, temperature);

    setDiseasePrediction(disease);
  }, [weatherData]);

  /* RISK PERIOD */
  useEffect(() => {
    let period = "-";

    if (riskScore >= 80) {
      period = "1-3 Hari";
    } else if (riskScore >= 50) {
      period = "3-7 Hari";
    } else {
      period = "7-14 Hari";
    }

    setRiskPeriod(period);
  }, [riskScore]);

  /* KIRIM DATA RISK USER KE PAGE.TSX */
  useEffect(() => {
    if (!onUserRiskChange || !userLocation || !weatherData) {
      return;
    }

    onUserRiskChange({
      region: userArea?.shapeName ?? "Lokasi Anda",
      province: userArea?.province,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      temperature: weatherData.temperature ?? 0,
      humidity: weatherData.humidity ?? 0,
      rain: weatherData.rain ?? 0,
      riskScore,
      riskStatus,
      diseasePrediction,
      riskPeriod,
    });
  }, [
    onUserRiskChange,
    userLocation,
    userArea,
    weatherData,
    riskScore,
    riskStatus,
    diseasePrediction,
    riskPeriod,
  ]);

  /* UPDATE WARNA USER AREA */
  useEffect(() => {
    if (!dynamicGeojson || !userArea) {
      return;
    }

    const updated = JSON.parse(JSON.stringify(dynamicGeojson));

    updated.features.forEach((feature: any) => {
      if (feature.properties?.shapeName === userArea.shapeName) {
        feature.properties.status = riskStatus;
      }
    });

    setDynamicGeojson(updated);
  }, [riskStatus, userArea]);

  /* USER AREA DETECTION */
  useEffect(() => {
    if (!userLocation || !geojson) {
      return;
    }

    const point = turf.point([userLocation.longitude, userLocation.latitude]);

    const foundArea = geojson.features.find((feature: any) => {
      try {
        return turf.booleanPointInPolygon(point, feature);
      } catch {
        return false;
      }
    });

    if (foundArea) {
      console.log(foundArea.properties);

      setUserArea({
        shapeName: foundArea.properties?.shapeName,
        province: foundArea.properties?.province,
        status: foundArea.properties?.status,
        rainfall: foundArea.properties?.rainfall,
        disease: foundArea.properties?.disease,
        period: foundArea.properties?.period,
      });
    }
  }, [userLocation, geojson]);

  const getStatusLabel = (status: string) => {
    if (status === "high") return "Risiko Tinggi";
    if (status === "warning") return "Waspada";
    return "Aman";
  };

  const flyToUserLocation = () => {
    if (!userLocation) return;

    mapRef.current?.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 9,
      duration: 1500,
    });
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <Map
          ref={mapRef}
          interactiveLayerIds={["kabupaten-fill"]}
          onMouseMove={(event) => {
            const feature = event.features?.[0];

            if (!feature) {
              setHoverInfo(null);
              return;
            }

            setHoverInfo({
              x: event.point.x,
              y: event.point.y,
              shapeName: feature.properties?.shapeName,
              province: feature.properties?.province,
              status: feature.properties?.status,
            });
          }}
          onMouseLeave={() => {
            setHoverInfo(null);
          }}
          onClick={(event) => {
            const feature = event.features?.[0];

            if (!feature) return;

            setSelectedArea({
              shapeName: feature.properties?.shapeName,
              province: feature.properties?.province,
              rainfall: feature.properties?.rainfall,
              disease: feature.properties?.disease,
              status: feature.properties?.status,
              period: feature.properties?.period,
            });

            setShowAreaPanel(false);
          }}
          initialViewState={{
            longitude: 118,
            latitude: -2,
            zoom: 5,
          }}
          minZoom={4.5}
          maxZoom={12}
          maxBounds={[
            [94, -11],
            [141, 7],
          ]}
          dragRotate={false}
          touchZoomRotate={false}
          style={{
            width: "100%",
            height: "650px",
          }}
          mapStyle="/map-style.json">
          <NavigationControl position="top-right" showCompass={false} />

          {geojson && (
            <Source
              id="indonesia"
              type="geojson"
              data={dynamicGeojson ?? geojson}>
              <Layer
                id="kabupaten-fill"
                type="fill"
                paint={{
                  "fill-color": [
                    "match",
                    ["get", "status"],
                    "high",
                    "#EF4444",
                    "warning",
                    "#FBBF24",
                    "#34D399",
                  ],
                  "fill-opacity": 0.65,
                }}
              />

              <Layer
                id="kabupaten-outline"
                type="line"
                paint={{
                  "line-color": "#475569",
                  "line-width": 0.35,
                }}
              />
            </Source>
          )}

          {userLocation && (
            <Marker
              longitude={userLocation.longitude}
              latitude={userLocation.latitude}
              anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg" />

                <div className="mt-1 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-xs font-semibold shadow-md">
                  Posisi Anda
                </div>
              </div>
            </Marker>
          )}
        </Map>

        {hoverInfo && (
          <div
            className="pointer-events-none absolute z-30 min-w-[220px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
            style={{
              left: Math.min(hoverInfo.x + 15, mapSize.width - 280),
              top: hoverInfo.y > 500 ? hoverInfo.y - 120 : hoverInfo.y + 15,
            }}>
            <h4 className="font-bold text-slate-900">{hoverInfo.shapeName}</h4>

            <p className="mt-1 text-sm text-slate-500">{hoverInfo.province}</p>

            <div
              className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background:
                  hoverInfo.status === "high"
                    ? "#FEE2E2"
                    : hoverInfo.status === "warning"
                      ? "#FEF3C7"
                      : "#DCFCE7",
                color:
                  hoverInfo.status === "high"
                    ? "#DC2626"
                    : hoverInfo.status === "warning"
                      ? "#D97706"
                      : "#15803D",
              }}>
              {getStatusLabel(hoverInfo.status)}
            </div>
          </div>
        )}

        {selectedArea && (
          <div className="absolute left-5 top-5 z-30">
            {!showAreaPanel ? (
              <button
                onClick={() => setShowAreaPanel(true)}
                className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900">
                    {selectedArea.shapeName}
                  </div>

                  <div
                    className={`text-xs ${
                      selectedArea.status === "high"
                        ? "text-red-600"
                        : selectedArea.status === "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}>
                    {getStatusLabel(selectedArea.status)}
                  </div>
                </div>

                <div className="text-lg text-slate-400">▼</div>
              </button>
            ) : (
              <div className="w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">
                    {selectedArea.shapeName}
                  </h4>

                  <button
                    onClick={() => setSelectedArea(null)}
                    className="text-slate-400 hover:text-red-500">
                    ✕
                  </button>
                </div>

                <p className="text-sm text-slate-500">
                  {selectedArea.province}
                </p>

                <hr className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Status</span>

                    <span
                      className={`font-semibold ${
                        selectedArea.status === "high"
                          ? "text-red-600"
                          : selectedArea.status === "warning"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}>
                      {getStatusLabel(selectedArea.status)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Curah Hujan</span>
                    <span>{selectedArea.rainfall}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Penyakit</span>
                    <span>{selectedArea.disease ?? "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Prediksi</span>
                    <span>{selectedArea.period}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {userArea && (
          <div className="absolute right-20 top-5 z-30">
            {!showUserPanel ? (
              <button
                onClick={() => setShowUserPanel(true)}
                className="flex min-w-[190px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg transition-all hover:shadow-xl">
                <div className="text-xl">📍</div>

                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900">
                    {userArea.shapeName}
                  </div>

                  <div
                    className={`text-xs ${
                      riskStatus === "high"
                        ? "text-red-600"
                        : riskStatus === "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}>
                    {getStatusLabel(riskStatus)}
                  </div>
                </div>

                <div className="text-lg text-slate-400">▼</div>
              </button>
            ) : (
              <div className="w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Lokasi Anda</h4>

                  <button
                    onClick={() => setShowUserPanel(false)}
                    className="text-lg text-slate-400 hover:text-red-500">
                    ✕
                  </button>
                </div>

                <p className="text-xl font-semibold text-slate-900">
                  {userArea.shapeName}
                </p>

                <p className="text-sm text-slate-500">
                  {userArea.province ?? "-"}
                </p>

                <hr className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>

                    <span
                      className={`font-semibold ${
                        riskStatus === "high"
                          ? "text-red-600"
                          : riskStatus === "warning"
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}>
                      {getStatusLabel(riskStatus)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Potensi Penyakit</span>

                    <span className="font-semibold text-slate-900">
                      {diseasePrediction}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Periode Risiko</span>

                    <span className="font-semibold text-slate-900">
                      {riskPeriod}
                    </span>
                  </div>

                  <hr className="my-2" />

                  <button
                    onClick={() => setShowWeatherDetail(!showWeatherDetail)}
                    className="flex w-full items-center justify-between text-sm font-medium text-slate-700">
                    <span>Detail Cuaca</span>
                    <span>{showWeatherDetail ? "▲" : "▼"}</span>
                  </button>

                  {showWeatherDetail && (
                    <div className="space-y-2 border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Risk Score</span>
                        <span className="font-semibold">{riskScore}/100</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Suhu</span>
                        <span className="font-semibold">
                          {weatherData?.temperature}°C
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Kelembapan</span>
                        <span className="font-semibold">
                          {weatherData?.humidity}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Curah Hujan</span>
                        <span className="font-semibold">
                          {weatherData?.rain} mm
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={flyToUserLocation}
          title="Lokasi Saya"
          className="absolute right-[10px] top-[70px] z-40 flex h-[30px] w-[30px] items-center justify-center border border-slate-300 bg-white text-[16px] font-bold shadow-sm hover:bg-slate-50">
          ⌖
        </button>

        <div className="absolute bottom-5 right-5 z-40 w-[190px] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          <h4 className="mb-3 font-bold text-slate-900">Status Risiko</h4>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-[#34D399]" />
              <span className="text-sm text-slate-700">Aman</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-[#FBBF24]" />
              <span className="text-sm text-slate-700">Waspada</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-[#EF4444]" />
              <span className="text-sm text-slate-700">Risiko Tinggi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Top 5 Risiko Tertinggi Nasional
        </h3>

        <div className="space-y-3">
          {topRiskAreas.map((area, index) => (
            <div
              key={area.shapeName}
              className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="font-semibold text-slate-900">
                  {index + 1}. {area.shapeName}
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  area.riskStatus === "high"
                    ? "bg-red-100 text-red-700"
                    : area.riskStatus === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}>
                {getStatusLabel(area.riskStatus)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Prediksi Risiko Nasional
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Status Hari Ini, 3 Hari Kedepan, dan 7 Hari Kedepan
            </p>
          </div>

          <input
            type="text"
            placeholder="Cari wilayah..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 md:w-[320px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 text-left">Wilayah</th>
                <th className="p-4 text-center">Hari Ini</th>
                <th className="p-4 text-center">+3 Hari</th>
                <th className="p-4 text-center">+7 Hari</th>
              </tr>
            </thead>

            <tbody>
              {paginatedPredictionList.map((area) => (
                <tr key={area.shapeName} className="border-b border-slate-100">
                  <td className="p-4 font-medium">{area.shapeName}</td>

                  <td className="text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        area.todayStatus === "high"
                          ? "bg-red-100 text-red-700"
                          : area.todayStatus === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {getStatusLabel(area.todayStatus)}
                    </span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        area.day3Status === "high"
                          ? "bg-red-100 text-red-700"
                          : area.day3Status === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {getStatusLabel(area.day3Status)}
                    </span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        area.day7Status === "high"
                          ? "bg-red-100 text-red-700"
                          : area.day7Status === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}>
                      {getStatusLabel(area.day7Status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-sm text-slate-500">
            Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredPredictionList.length,
            )}{" "}
            dari {filteredPredictionList.length} wilayah
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50">
              Prev
            </button>

            {Array.from(
              {
                length: Math.min(totalPages, 10),
              },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3 py-2 ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300"
                }`}>
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
