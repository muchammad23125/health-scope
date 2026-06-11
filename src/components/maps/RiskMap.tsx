"use client";

import { useEffect, useRef, useState } from "react";

import * as turf from "@turf/turf";

import {
  calculateRisk,
} from "@/services/riskEngine";

import {
  predictDisease,
} from "@/services/diseaseEngine";

import {
  getRecommendations,
} from "@/services/recommendationEngine";

import {
  fetchWeatherData
} from "@/services/weatherService";


import Map, {
  NavigationControl,
  Source,
  Layer,
  Marker,
  Popup,
} from "react-map-gl/maplibre";

import { outbreakData } from "@/data/outbreak-data";

export default function RiskMap() {

  const [geojson, setGeojson] = useState<any>(null);

  const [hoverInfo, setHoverInfo] =
    useState<any>(null);

  const [selectedArea, setSelectedArea] =
    useState<any>(null);

  const [userLocation, setUserLocation] =
    useState<any>(null);

  const [gpsAccuracy,
    setGpsAccuracy] =
    useState<number>(0);

  const [userArea, setUserArea] =
    useState<any>(null);

  const [weatherData, setWeatherData] =
    useState<any>(null);

  const [riskStatus, setRiskStatus] =
    useState("safe");

  const [riskScore, setRiskScore] =
    useState(0);

  const [diseasePrediction,
    setDiseasePrediction] =
    useState("-");

  const [riskPeriod,
    setRiskPeriod] =
    useState("-");

  const [showUserPanel,
    setShowUserPanel] =
    useState(false);

  const [showAreaPanel,
    setShowAreaPanel] =
    useState(false);

  const [recommendations,
    setRecommendations] =
    useState<string[]>([]);

  const [showWeatherDetail,
    setShowWeatherDetail] =
    useState(false);

  const [dynamicGeojson, setDynamicGeojson] =
    useState<any>(null);

  /* DATA RISK MAP API */

  const [riskMapData,
    setRiskMapData] =
    useState<any[]>([]);

  const [predictionList,
    setPredictionList] =
    useState<any[]>([]);

  const [searchKeyword,
    setSearchKeyword] =
    useState("");

  const [heatmapSummary,
    setHeatmapSummary] =
    useState({

      safe: 0,

      warning: 0,

      high: 0,

    });

  const [currentPage,
    setCurrentPage] =
    useState(1);

  const ITEMS_PER_PAGE =
    15;

  const [todaySummary,
    setTodaySummary] =
    useState({

      high: 0,

      warning: 0,

      safe: 0,

    });

  const [topRiskAreas,
    setTopRiskAreas] =
    useState<any[]>([]);

  const [lastUpdate,
    setLastUpdate] =
    useState<Date | null>(
      null
    );

  const [firstLocationLoaded,
    setFirstLocationLoaded] =
    useState(false);

  const [mapSize, setMapSize] =
    useState({
      width: 0,
      height: 0,
    });

  const mapRef = useRef<any>(null);

  const hasFocusedUser =
    useRef(false);

  /* LOAD GEOJSON + INITIAL OUTBREAK DATA */

  useEffect(() => {

    fetch("/data/indonesia.geojson")
      .then((res) => res.json())
      .then((data) => {

        data.features.forEach(
          (feature: any) => {

            feature.properties.status =
              "safe";

            feature.properties.rainfall =
              0;

            feature.properties.disease =
              "-";

            feature.properties.province =
              "-";

            feature.properties.period =
              "7-14 Hari";

          }
        );

        setGeojson(data);
        setDynamicGeojson(
          JSON.parse(
            JSON.stringify(data)
          )
        );

        setTimeout(() => {

          mapRef.current?.fitBounds(
            [
              [95, -11],
              [141, 6],
            ],
            {
              padding: 20,
              duration: 1200,
            }
          );

        }, 500);

      });

  }, []);

  /* LOAD RISK MAP API + AUTO REFRESH */

  useEffect(() => {

    const loadRiskMap =
      async () => {

        try {

          const response =
            await fetch(
              "/api/risk-map"
            );

          const result =
            await response.json();

          if (
            result.success
          ) {

            /* DATA MAP */

            setRiskMapData(
              result.data
            );

            /* TOP PREDIKSI */

            setPredictionList(

              result.data

                .filter(
                  (item: any) =>
                    !item.error
                )

                .sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    b.riskScore -
                    a.riskScore
                )

            );

            /* HITUNG SUMMARY HARI INI */

            const high =
              result.data.filter(
                (item: any) =>
                  item.riskStatus ===
                  "high"
              ).length;

            const warning =
              result.data.filter(
                (item: any) =>
                  item.riskStatus ===
                  "warning"
              ).length;

            const safe =
              result.data.filter(
                (item: any) =>
                  item.riskStatus ===
                  "safe"
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

            setLastUpdate(
              new Date()
            );

            console.log(
              "Risk Map API Loaded:",
              result.data.length
            );

            console.log(
              "Today Summary:",
              {
                high,
                warning,
                safe,
              }
            );

            console.log(
              "Prediction List:",
              result.data
                .filter(
                  (item: any) =>
                    !item.error
                )
                .slice(
                  0,
                  5
                )
            );

          }

        } catch (error) {

          console.error(
            "Risk Map API Error:",
            error
          );

        }

      };

    /* LOAD PERTAMA */

    loadRiskMap();

    /* AUTO REFRESH 15 MENIT */

    const interval =
      setInterval(
        loadRiskMap,
        15 * 60 * 1000
      );

    return () => {

      clearInterval(
        interval
      );

    };

  }, []);

  /* UPDATE WARNA PETA DARI API */

  useEffect(() => {

    if (
      !geojson ||
      !riskMapData.length
    ) {
      return;
    }

    const updatedGeojson =
      JSON.parse(
        JSON.stringify(
          geojson
        )
      );

    updatedGeojson.features.forEach(
      (feature: any) => {

        const riskData =
          riskMapData.find(
            (item: any) =>
              item.shapeName ===
              feature.properties
                ?.shapeName
          );

        if (riskData) {

          feature.properties.status =
            riskData.riskStatus;

          feature.properties.riskScore =
            riskData.riskScore;

          feature.properties.disease =
            riskData.disease;

        }

      }
    );

    setDynamicGeojson(
      updatedGeojson
    );

    console.log(
      "GeoJSON Updated:",
      updatedGeojson.features.length
    );

  }, [
    geojson,
    riskMapData,
  ]);

  /* TOP 10 RISIKO NASIONAL */

  useEffect(() => {

    if (
      !riskMapData.length
    ) {
      return;
    }

    const topAreas =

      [...riskMapData]

        .filter(
          (item) =>
            item.riskScore >= 50
        )

        .sort(
          (a, b) =>
            b.riskScore -
            a.riskScore
        )

        .slice(
          0,
          10
        );

    setTopRiskAreas(
      topAreas
    );

    console.log(
      "Top Risk Areas:",
      topAreas
    );

  }, [riskMapData]);

  /* RESET PAGINATION SAAT SEARCH */

  useEffect(() => {

    setCurrentPage(1);

  }, [searchKeyword]);

  /* FILTER PENCARIAN */

  const filteredPredictionList =

    predictionList.filter(
      (item: any) =>

        item.shapeName
          ?.toLowerCase()
          .includes(
            searchKeyword
              .toLowerCase()
          )
    );

  const totalPages =

    Math.ceil(

      filteredPredictionList.length /

      ITEMS_PER_PAGE

    );

  const paginatedPredictionList =

    filteredPredictionList.slice(

      (currentPage - 1) *
      ITEMS_PER_PAGE,

      currentPage *
      ITEMS_PER_PAGE

    );


  /* UPDATE PETA DARI RISK MAP API */

  useEffect(() => {

    if (
      !geojson ||
      riskMapData.length === 0
    ) {
      return;
    }

    const updated =
      JSON.parse(
        JSON.stringify(
          geojson
        )
      );

    updated.features.forEach(
      (feature: any) => {

        const area =
          riskMapData.find(
            (item) =>
              item.shapeName ===
              feature.properties.shapeName
          );

        feature.properties.status =
          area?.riskStatus ??
          "safe";

        feature.properties.disease =
          area?.disease ??
          "-";

      }
    );

    setDynamicGeojson(
      updated
    );

    console.log(
      "Risk Map Applied:",
      riskMapData.length
    );

  }, [
    geojson,
    riskMapData
  ]);

  /* RESPONSIVE MAP SIZE */

  useEffect(() => {

    const updateSize = () => {

      setMapSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    };

    updateSize();

    window.addEventListener(
      "resize",
      updateSize
    );

    return () => {

      window.removeEventListener(
        "resize",
        updateSize
      );

    };

  }, []);

  /* GEOLOCATION USER */

  useEffect(() => {

    if (!navigator.geolocation) {

      console.log(
        "Geolocation tidak didukung"
      );

      return;

    }

    const watchId =
      navigator.geolocation.watchPosition(

        (position) => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          setUserLocation({

            latitude,
            longitude,

          });

          setGpsAccuracy(
            accuracy
          );

          console.log(
            "Realtime Location:",
            latitude,
            longitude
          );

          if (!hasFocusedUser.current) {

            mapRef.current?.flyTo({

              center: [
                longitude,
                latitude,
              ],

              zoom: 9,

              duration: 2500,

            });

            hasFocusedUser.current = true;

          }

        },

        (error) => {

          console.error(
            "Gagal mendapatkan lokasi:",
            error
          );

        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }

      );

    return () => {

      navigator.geolocation.clearWatch(
        watchId
      );

    };

  }, []);

  /* OPEN METEO */

  useEffect(() => {

    if (!userLocation) return;

    const loadWeather =
      async () => {

        try {

          const data =
            await fetchWeatherData(

              userLocation.latitude,

              userLocation.longitude

            );

          setWeatherData(data);

          console.log(
            "Weather Data:",
            data
          );

        } catch (error) {

          console.error(
            "Open Meteo Error:",
            error
          );

        }

      };

    loadWeather();

  }, [userLocation]);

  /* RISK ENGINE */

  useEffect(() => {

    if (!weatherData) return;

    const humidity =
      weatherData.humidity ?? 0;

    const rain =
      weatherData.rain ?? 0;

    const temperature =
      weatherData.temperature ?? 0;

    const result =
      calculateRisk(
        humidity,
        rain,
        temperature
      );

    setRiskScore(
      result.score
    );

    setRiskStatus(
      result.status
    );

    console.log(
      "Risk Score:",
      result.score
    );

    console.log(
      "Risk Status:",
      result.status
    );

  }, [weatherData]);

  /* DISEASE PREDICTION */

  useEffect(() => {

    if (!weatherData) return;

    const humidity =
      weatherData.humidity ?? 0;

    const rain =
      weatherData.rain ?? 0;

    const temperature =
      weatherData.temperature ?? 0;

    const disease =
      predictDisease(
        humidity,
        rain,
        temperature
      );

    setDiseasePrediction(
      disease
    );

  }, [weatherData]);

  /* RISK PERIOD */

  useEffect(() => {

    let period = "-";

    if (riskScore >= 80) {

      period = "1-3 Hari";

    }

    else if (
      riskScore >= 50
    ) {

      period = "3-7 Hari";

    }

    else {

      period = "7-14 Hari";

    }

    setRiskPeriod(period);

  }, [riskScore]);

  /* RECOMMENDATION ENGINE */

  useEffect(() => {

    const recs =
      getRecommendations(
        diseasePrediction
      );

    setRecommendations(
      recs
    );

  }, [diseasePrediction]);

  /* UPDATE WARNA USER AREA */

  useEffect(() => {

    if (
      !dynamicGeojson ||
      !userArea
    ) {
      return;
    }

    const updated =
      JSON.parse(
        JSON.stringify(
          dynamicGeojson
        )
      );

    updated.features.forEach(
      (feature: any) => {

        if (

          feature.properties
            ?.shapeName ===
          userArea.shapeName

        ) {

          feature.properties.status =
            riskStatus;

        }

      }
    );

    setDynamicGeojson(
      updated
    );

  }, [
    riskStatus,
    userArea,
  ]);

  /* USER AREA DETECTION */

  useEffect(() => {

    if (
      !userLocation ||
      !geojson
    ) {
      return;
    }

    const point = turf.point([

      userLocation.longitude,

      userLocation.latitude,

    ]);

    const foundArea =
      geojson.features.find(
        (feature: any) => {

          try {

            return turf.booleanPointInPolygon(
              point,
              feature
            );

          } catch {

            return false;

          }

        }
      );

    if (foundArea) {

      console.log(
        foundArea.properties
      );

      setUserArea({

        shapeName:
          foundArea.properties?.shapeName,

        province:
          foundArea.properties?.province,

        status:
          foundArea.properties?.status,

        rainfall:
          foundArea.properties?.rainfall,

        disease:
          foundArea.properties?.disease,

        period:
          foundArea.properties?.period,

      });

    }

  }, [
    userLocation,
    geojson,
  ]);

  const getStatusLabel = (
    status: string
  ) => {

    if (status === "high")
      return "Risiko Tinggi";

    if (status === "warning")
      return "Waspada";

    return "Aman";

  };

  const flyToUserLocation = () => {

    if (!userLocation) return;

    mapRef.current?.flyTo({

      center: [
        userLocation.longitude,
        userLocation.latitude,
      ],

      zoom: 9,

      duration: 1500,

    });

  };

  return (

    <div>
      <div
        className="
        relative
        overflow-hidden
        rounded-3xl
        shadow-lg
        border
        border-slate-200
      "
      >

        <Map

          ref={mapRef}

          interactiveLayerIds={[
            "kabupaten-fill"
          ]}

          onMouseMove={(event) => {

            const feature =
              event.features?.[0];

            if (!feature) {

              setHoverInfo(null);

              return;

            }

            setHoverInfo({

              x: event.point.x,

              y: event.point.y,

              shapeName:
                feature.properties?.shapeName,

              province:
                feature.properties?.province,

              status:
                feature.properties?.status,

            });

          }}

          onMouseLeave={() => {

            setHoverInfo(null);

          }}

          onClick={(event) => {

            const feature =
              event.features?.[0];

            if (!feature) return;

            setSelectedArea({

              shapeName:
                feature.properties?.shapeName,

              province:
                feature.properties?.province,

              rainfall:
                feature.properties?.rainfall,

              disease:
                feature.properties?.disease,

              status:
                feature.properties?.status,

              period:
                feature.properties?.period,

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

          mapStyle="/map-style.json"
        >

          <NavigationControl
            position="top-right"
            showCompass={false}
          />

          {geojson && (

            <Source
              id="indonesia"
              type="geojson"
              data={
                dynamicGeojson ??
                geojson
              }
            >

              {/* WARNA RISIKO */}

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

              {/* BATAS KABUPATEN */}

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

          {/* MARKER LOKASI USER */}

          {userLocation && (

            <Marker

              longitude={
                userLocation.longitude
              }

              latitude={
                userLocation.latitude
              }

              anchor="bottom"

            >

              <div
                className="
          flex
          flex-col
          items-center
        "
              >

                <div
                  className="
            w-5
            h-5
            rounded-full
            bg-blue-500
            border-4
            border-white
            shadow-lg
          "
                />

                <div
                  className="
            mt-1
            px-2
            py-1
            rounded-lg
            bg-white
            text-xs
            font-semibold
            shadow-md
            whitespace-nowrap
          "
                >
                  Posisi Anda
                </div>

              </div>

            </Marker>

          )}

        </Map>

        {/* TOOLTIP HOVER */}

        {hoverInfo && (

          <div
            className="
      absolute
      z-30
      pointer-events-none
      bg-white
      border
      border-slate-200
      rounded-xl
      shadow-xl
      px-4
      py-3
      min-w-[220px]
    "
            style={{

              left: Math.min(
                hoverInfo.x + 15,
                mapSize.width - 280
              ),

              top:

                hoverInfo.y > 500
                  ? hoverInfo.y - 120
                  : hoverInfo.y + 15,

            }}
          >

            <h4
              className="
        font-bold
        text-slate-900
      "
            >
              {hoverInfo.shapeName}
            </h4>

            <p
              className="
        text-sm
        text-slate-500
        mt-1
      "
            >
              {hoverInfo.province}
            </p>

            <div
              className="
        mt-3
        inline-flex
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
      "
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

              }}
            >

              {hoverInfo.status === "high"

                ? "Risiko Tinggi"

                : hoverInfo.status === "warning"

                  ? "Waspada"

                  : "Aman"}

            </div>

          </div>

        )}

        {selectedArea && (

          <div
            className="
      absolute
      top-5
      left-5
      z-30
    "
          >

            {!showAreaPanel ? (

              <button
                onClick={() =>
                  setShowAreaPanel(true)
                }
                className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-lg
          px-4
          py-3
          flex
          items-center
          gap-3
          min-w-[190px]
        "
              >

                <div
                  className="
            flex-1
            text-left
          "
                >

                  <div
                    className="
              font-semibold
              text-slate-900
            "
                  >
                    {selectedArea.shapeName}
                  </div>

                  <div
                    className={`
              text-xs
              ${selectedArea.status === "high"
                        ? "text-red-600"
                        : selectedArea.status === "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
            `}
                  >
                    {getStatusLabel(
                      selectedArea.status
                    )}
                  </div>

                </div>

                <div
                  className="
            text-slate-400
            text-lg
          "
                >
                  ▼
                </div>

              </button>

            ) : (

              <div
                className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-xl
          p-4
          w-[280px]
        "
              >

                <div
                  className="
            flex
            justify-between
            items-center
            mb-4
          "
                >

                  <h4
                    className="
              font-bold
              text-slate-900
            "
                  >
                    {selectedArea.shapeName}
                  </h4>

                  <button
                    onClick={() =>
                      setSelectedArea(null)
                    }
                    className="
              text-slate-400
              hover:text-red-500
            "
                  >
                    ✕
                  </button>

                </div>

                <p
                  className="
            text-sm
            text-slate-500
          "
                >
                  {selectedArea.province}
                </p>

                <hr className="my-4" />

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">

                    <span>Status</span>

                    <span
                      className={`
                font-semibold
                ${selectedArea.status === "high"
                          ? "text-red-600"
                          : selectedArea.status === "warning"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
              `}
                    >
                      {getStatusLabel(
                        selectedArea.status
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Curah Hujan</span>

                    <span>
                      {selectedArea.rainfall}%
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Penyakit</span>

                    <span>
                      {selectedArea.disease ?? "-"}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>Prediksi</span>

                    <span>
                      {selectedArea.period}
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

        {/* USER AREA */}

        {userArea && (

          <div
            className="
      absolute
      top-5
      right-20
      z-30
    "
          >

            {!showUserPanel ? (

              <button
                onClick={() =>
                  setShowUserPanel(true)
                }
                className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-lg
          px-4
          py-3
          flex
          items-center
          gap-3
          min-w-[190px]
          hover:shadow-xl
          transition-all
        "
              >

                <div
                  className="
            text-xl
          "
                >
                  📍
                </div>

                <div
                  className="
            flex-1
            text-left
          "
                >

                  <div
                    className="
              font-semibold
              text-slate-900
            "
                  >
                    {userArea.shapeName}
                  </div>

                  <div
                    className={`
              text-xs
              ${riskStatus === "high"
                        ? "text-red-600"
                        : riskStatus === "warning"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }
            `}
                  >
                    {getStatusLabel(riskStatus)}
                  </div>

                </div>

                <div
                  className="
            text-slate-400
            text-lg
          "
                >
                  ▼
                </div>

              </button>

            ) : (

              <div
                className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          shadow-xl
          p-4
          w-[280px]
        "
              >

                <div
                  className="
            flex
            justify-between
            items-center
            mb-4
          "
                >

                  <h4
                    className="
              font-bold
              text-slate-900
            "
                  >
                    Lokasi Anda
                  </h4>

                  <button
                    onClick={() =>
                      setShowUserPanel(false)
                    }
                    className="
              text-slate-400
              hover:text-red-500
              text-lg
            "
                  >
                    ✕
                  </button>

                </div>

                <p
                  className="
            text-xl
            font-semibold
            text-slate-900
          "
                >
                  {userArea.shapeName}
                </p>

                <p
                  className="
            text-sm
            text-slate-500
          "
                >
                  {userArea.province ?? "-"}
                </p>

                <hr className="my-4" />

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      Status
                    </span>

                    <span
                      className={`
                font-semibold
                ${riskStatus === "high"
                          ? "text-red-600"
                          : riskStatus === "warning"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
              `}
                    >
                      {getStatusLabel(riskStatus)}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      Potensi Penyakit
                    </span>

                    <span
                      className="
                font-semibold
                text-slate-900
              "
                    >
                      {diseasePrediction}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-slate-500">
                      Periode Risiko
                    </span>

                    <span
                      className="
                font-semibold
                text-slate-900
              "
                    >
                      {riskPeriod}
                    </span>

                  </div>

                  <hr className="my-2" />

                  <div>

                    <p
                      className="
                text-slate-500
                mb-2
              "
                    >
                      Rekomendasi
                    </p>

                    <ul
                      className="
                space-y-1
                text-sm
                text-slate-700
              "
                    >

                      {recommendations.map(
                        (
                          item,
                          index
                        ) => (

                          <li
                            key={index}
                            className="
                      flex
                      gap-2
                      items-start
                    "
                          >

                            <span
                              className="
                        text-emerald-600
                        font-bold
                      "
                            >
                              •
                            </span>

                            <span>
                              {item}
                            </span>

                          </li>

                        )
                      )}

                    </ul>

                  </div>

                  <hr className="my-2" />

                  <button
                    onClick={() =>
                      setShowWeatherDetail(
                        !showWeatherDetail
                      )
                    }
                    className="
              w-full
              flex
              justify-between
              items-center
              text-sm
              font-medium
              text-slate-700
            "
                  >

                    <span>
                      Detail Cuaca
                    </span>

                    <span>

                      {showWeatherDetail
                        ? "▲"
                        : "▼"}

                    </span>

                  </button>

                  {showWeatherDetail && (

                    <div
                      className="
                pt-3
                border-t
                border-slate-200
                space-y-2
              "
                    >

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Risk Score
                        </span>

                        <span className="font-semibold">
                          {riskScore}/100
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Suhu
                        </span>

                        <span className="font-semibold">
                          {weatherData?.temperature}°C
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Kelembapan
                        </span>

                        <span className="font-semibold">
                          {weatherData?.humidity}%
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Curah Hujan
                        </span>

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

        {/* BUTTON LOKASI SAYA */}

        <button

          onClick={flyToUserLocation}

          title="Lokasi Saya"

          className="
    absolute
    top-[70px]
    right-[10px]
    z-40

    w-[30px]
    h-[30px]

    bg-white

    border
    border-slate-300

    shadow-sm

    flex
    items-center
    justify-center

    text-[16px]
    font-bold

    hover:bg-slate-50
  "
        >

          ⌖

        </button>


        {/* LEGEND */}

        <div
          className="
    absolute
    bottom-5
    right-5
    bg-white/95
    backdrop-blur-sm
    rounded-2xl
    shadow-xl
    border
    border-slate-200
    p-4
    z-40
    w-[190px]
          "
        >

          <h4
            className="
              font-bold
              text-slate-900
              mb-3
            "
          >
            Status Risiko
          </h4>

          <div className="space-y-3">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-4
                  h-4
                  rounded-full
                  bg-[#34D399]
                "
              />

              <span
                className="
                  text-sm
                  text-slate-700
                "
              >
                Aman
              </span>

            </div>

            <div className="flex items-center gap-3">

              <div
                className="
                  w-4
                  h-4
                  rounded-full
                  bg-[#FBBF24]
                "
              />

              <span
                className="
                  text-sm
                  text-slate-700
                "
              >
                Waspada
              </span>

            </div>

            <div className="flex items-center gap-3">

              <div
                className="
                  w-4
                  h-4
                  rounded-full
                  bg-[#EF4444]
                "
              />

              <span
                className="
                  text-sm
                  text-slate-700
                "
              >
                Risiko Tinggi
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* TOP 10 RISIKO NASIONAL */}

      <div
        className="
          mt-8
          bg-white
          rounded-2xl
          border
          border-slate-200
          shadow-sm
          p-6
        "
      >

        <h3
          className="
            text-xl
            font-bold
            text-slate-900
            mb-4
          "
        >
          Top 10 Risiko Tertinggi Nasional
        </h3>

        <div className="space-y-3">

          {topRiskAreas.map(
            (
              area,
              index
            ) => (

              <div
                key={area.shapeName}
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  pb-3
                "
              >

                <div>

                  <div
                    className="
                      font-semibold
                      text-slate-900
                    "
                  >
                    {index + 1}. {area.shapeName}
                  </div>

                  <div
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Risk Score:
                    {" "}
                    {area.riskScore}
                    /100
                  </div>

                </div>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-xs
                    font-semibold

                    ${area.riskStatus === "high"

                      ? "bg-red-100 text-red-700"

                      : area.riskStatus === "warning"

                        ? "bg-amber-100 text-amber-700"

                        : "bg-emerald-100 text-emerald-700"
                    }
                  `}
                >
                  {getStatusLabel(
                    area.riskStatus
                  )}
                </span>

              </div>

            )
          )}

        </div>

      </div>


      {/* PREDIKSI RISIKO NASIONAL */}

      <div
        className="
    mt-8
    bg-white
    rounded-2xl
    border
    border-slate-200
    shadow-sm
    p-6
  "
      >

        <div
          className="
      flex
      flex-col
      md:flex-row
      md:items-center
      md:justify-between
      gap-4
      mb-6
    "
        >

          <div>

            <h3
              className="
          text-xl
          font-bold
          text-slate-900
        "
            >
              Prediksi Risiko Nasional
            </h3>

            <p
              className="
          text-sm
          text-slate-500
          mt-1
        "
            >
              Status Hari Ini, 3 Hari Kedepan, dan 7 Hari Kedepan
            </p>

          </div>

          <input
            type="text"
            placeholder="Cari wilayah..."
            value={searchKeyword}
            onChange={(e) =>
              setSearchKeyword(
                e.target.value
              )
            }
            className="
        w-full
        md:w-[320px]
        px-4
        py-2
        border
        border-slate-300
        rounded-xl
        outline-none
        focus:ring-2
        focus:ring-blue-500
      "
          />

        </div>

        <div className="overflow-x-auto">

          <table
            className="
      w-full
      text-sm
      border-collapse
    "
          >

            <thead>

              <tr
                className="
          border-b
          bg-slate-50
        "
              >

                <th className="text-left p-4">
                  Wilayah
                </th>

                <th className="text-center p-4">
                  Hari Ini
                </th>

                <th className="text-center p-4">
                  +3 Hari
                </th>

                <th className="text-center p-4">
                  +7 Hari
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedPredictionList.map(
                (area) => (

                  <tr
                    key={area.shapeName}
                    className="
              border-b
              border-slate-100
            "
                  >

                    <td
                      className="
                p-4
                font-medium
              "
                    >
                      {area.shapeName}
                    </td>

                    <td className="text-center">

                      <span
                        className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold

                  ${area.todayStatus === "high"

                            ? "bg-red-100 text-red-700"

                            : area.todayStatus === "warning"

                              ? "bg-amber-100 text-amber-700"

                              : "bg-emerald-100 text-emerald-700"
                          }
                `}
                      >
                        {getStatusLabel(
                          area.todayStatus
                        )}
                      </span>

                    </td>

                    <td className="text-center">

                      <span
                        className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold

                  ${area.day3Status === "high"

                            ? "bg-red-100 text-red-700"

                            : area.day3Status === "warning"

                              ? "bg-amber-100 text-amber-700"

                              : "bg-emerald-100 text-emerald-700"
                          }
                `}
                      >
                        {getStatusLabel(
                          area.day3Status
                        )}
                      </span>

                    </td>

                    <td className="text-center">

                      <span
                        className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  font-semibold

                  ${area.day7Status === "high"

                            ? "bg-red-100 text-red-700"

                            : area.day7Status === "warning"

                              ? "bg-amber-100 text-amber-700"

                              : "bg-emerald-100 text-emerald-700"
                          }
                `}
                      >
                        {getStatusLabel(
                          area.day7Status
                        )}
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {/* INFO DATA */}

          <div
            className="
      mt-4
      text-sm
      text-slate-500
    "
          >

            Menampilkan

            {" "}

            {(currentPage - 1) *
              ITEMS_PER_PAGE + 1}

            -

            {" "}

            {Math.min(
              currentPage *
              ITEMS_PER_PAGE,
              filteredPredictionList.length
            )}

            dari

            {" "}

            {filteredPredictionList.length}

            wilayah

          </div>

          {/* PAGINATION */}

          <div
            className="
      flex
      justify-center
      items-center
      gap-2
      mt-6
    "
          >

            <button
              onClick={() =>
                setCurrentPage(
                  Math.max(
                    currentPage - 1,
                    1
                  )
                )
              }
              disabled={
                currentPage === 1
              }
              className="
        px-4
        py-2
        rounded-lg
        border
        border-slate-300
        disabled:opacity-50
      "
            >
              Prev
            </button>

            {Array.from(
              {
                length: Math.min(
                  totalPages,
                  10
                ),
              },
              (_, i) => i + 1
            ).map((page) => (

              <button
                key={page}
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
                className={`
          px-3
          py-2
          rounded-lg

          ${currentPage === page

                    ? "bg-blue-600 text-white"

                    : "border border-slate-300"
                  }
        `}
              >
                {page}
              </button>

            ))}

            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    currentPage + 1,
                    totalPages
                  )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="
        px-4
        py-2
        rounded-lg
        border
        border-slate-300
        disabled:opacity-50
      "
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* PREDIKSI HARI INI */}

      {false && (
        <div
          className="
  mt-6
  bg-white
  rounded-3xl
  shadow-lg
  border
  border-slate-200
  p-6
"
        >

          <h2
            className="
    text-2xl
    font-bold
    mb-5
  "
          >
            Prediksi Risiko Hari Ini
          </h2>

          <div
            className="
    grid
    md:grid-cols-3
    gap-4
  "
          >

            <div
              className="
      bg-red-50
      border
      border-red-200
      rounded-2xl
      p-5
    "
            >

              <p className="text-red-600 font-semibold">
                Risiko Tinggi
              </p>

              <p className="text-4xl font-bold">
                {todaySummary.high}
              </p>

              <p className="text-sm text-slate-500">
                Wilayah
              </p>

            </div>

            <div
              className="
      bg-amber-50
      border
      border-amber-200
      rounded-2xl
      p-5
    "
            >

              <p className="text-amber-600 font-semibold">
                Waspada
              </p>

              <p className="text-4xl font-bold">
                {todaySummary.warning}
              </p>

              <p className="text-sm text-slate-500">
                Wilayah
              </p>

            </div>

            <div
              className="
      bg-emerald-50
      border
      border-emerald-200
      rounded-2xl
      p-5
    "
            >

              <p className="text-emerald-600 font-semibold">
                Aman
              </p>

              <p className="text-4xl font-bold">
                {todaySummary.safe}
              </p>

              <p className="text-sm text-slate-500">
                Wilayah
              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}