export interface OutbreakArea {

  shapeName: string;

  province: string;

  rainfall: number;

  status:
    | "safe"
    | "warning"
    | "high";

  disease:
    | "DBD"
    | "ISPA"
    | "Diare"
    | "Leptospirosis"
    | null;

  period: string;
}

export const outbreakData: OutbreakArea[] = [

  // ACEH

  {
    shapeName: "Aceh Barat",
    province: "Aceh",
    rainfall: 82,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Barat Daya",
    province: "Aceh",
    rainfall: 74,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Besar",
    province: "Aceh",
    rainfall: 56,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Jaya",
    province: "Aceh",
    rainfall: 22,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Selatan",
    province: "Aceh",
    rainfall: 78,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Singkil",
    province: "Aceh",
    rainfall: 85,
    status: "high",
    disease: "Leptospirosis",
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Tamiang",
    province: "Aceh",
    rainfall: 43,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Tengah",
    province: "Aceh",
    rainfall: 27,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Tenggara",
    province: "Aceh",
    rainfall: 76,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Aceh Timur",
    province: "Aceh",
    rainfall: 67,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  // SUMATERA UTARA

  {
    shapeName: "Asahan",
    province: "Sumatera Utara",
    rainfall: 71,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Batu Bara",
    province: "Sumatera Utara",
    rainfall: 62,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Dairi",
    province: "Sumatera Utara",
    rainfall: 28,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Deli Serdang",
    province: "Sumatera Utara",
    rainfall: 88,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Humbang Hasundutan",
    province: "Sumatera Utara",
    rainfall: 35,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Karo",
    province: "Sumatera Utara",
    rainfall: 52,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Labuhan Batu",
    province: "Sumatera Utara",
    rainfall: 81,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Langkat",
    province: "Sumatera Utara",
    rainfall: 75,
    status: "high",
    disease: "Leptospirosis",
    period: "7-14 Hari",
  },

  {
    shapeName: "Mandailing Natal",
    province: "Sumatera Utara",
    rainfall: 29,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Nias",
    province: "Sumatera Utara",
    rainfall: 41,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  // SUMATERA BARAT

  {
    shapeName: "Agam",
    province: "Sumatera Barat",
    rainfall: 73,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Dharmasraya",
    province: "Sumatera Barat",
    rainfall: 21,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Lima Puluh Kota",
    province: "Sumatera Barat",
    rainfall: 54,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Padang Pariaman",
    province: "Sumatera Barat",
    rainfall: 79,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Pasaman",
    province: "Sumatera Barat",
    rainfall: 61,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  // RIAU

  {
    shapeName: "Bengkalis",
    province: "Riau",
    rainfall: 84,
    status: "high",
    disease: "Leptospirosis",
    period: "7-14 Hari",
  },

  {
    shapeName: "Indragiri Hilir",
    province: "Riau",
    rainfall: 72,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Indragiri Hulu",
    province: "Riau",
    rainfall: 55,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Kampar",
    province: "Riau",
    rainfall: 27,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Rokan Hilir",
    province: "Riau",
    rainfall: 83,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  // DKI JAKARTA

  {
    shapeName: "Jakarta Barat",
    province: "DKI Jakarta",
    rainfall: 77,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Jakarta Pusat",
    province: "DKI Jakarta",
    rainfall: 63,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Jakarta Selatan",
    province: "DKI Jakarta",
    rainfall: 88,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Jakarta Timur",
    province: "DKI Jakarta",
    rainfall: 74,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Jakarta Utara",
    province: "DKI Jakarta",
    rainfall: 45,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  // JAWA BARAT

  {
    shapeName: "Bandung",
    province: "Jawa Barat",
    rainfall: 85,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Bekasi",
    province: "Jawa Barat",
    rainfall: 68,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Bogor",
    province: "Jawa Barat",
    rainfall: 92,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Cirebon",
    province: "Jawa Barat",
    rainfall: 38,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Garut",
    province: "Jawa Barat",
    rainfall: 81,
    status: "high",
    disease: "Leptospirosis",
    period: "7-14 Hari",
  },

  // JAWA TENGAH

  {
    shapeName: "Banyumas",
    province: "Jawa Tengah",
    rainfall: 76,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Cilacap",
    province: "Jawa Tengah",
    rainfall: 83,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Kudus",
    province: "Jawa Tengah",
    rainfall: 59,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Semarang",
    province: "Jawa Tengah",
    rainfall: 71,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Tegal",
    province: "Jawa Tengah",
    rainfall: 24,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  // DIY

  {
    shapeName: "Bantul",
    province: "DI Yogyakarta",
    rainfall: 72,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Gunung Kidul",
    province: "DI Yogyakarta",
    rainfall: 34,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Kulon Progo",
    province: "DI Yogyakarta",
    rainfall: 25,
    status: "safe",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Sleman",
    province: "DI Yogyakarta",
    rainfall: 80,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  // JAWA TIMUR

  {
    shapeName: "Banyuwangi",
    province: "Jawa Timur",
    rainfall: 84,
    status: "high",
    disease: "Leptospirosis",
    period: "7-14 Hari",
  },

  {
    shapeName: "Jember",
    province: "Jawa Timur",
    rainfall: 77,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  {
    shapeName: "Malang",
    province: "Jawa Timur",
    rainfall: 61,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Sidoarjo",
    province: "Jawa Timur",
    rainfall: 73,
    status: "high",
    disease: "ISPA",
    period: "7-14 Hari",
  },

  {
    shapeName: "Surabaya",
    province: "Jawa Timur",
    rainfall: 87,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

  // BALI

  {
    shapeName: "Badung",
    province: "Bali",
    rainfall: 70,
    status: "high",
    disease: "Diare",
    period: "7-14 Hari",
  },

  {
    shapeName: "Buleleng",
    province: "Bali",
    rainfall: 46,
    status: "warning",
    disease: null,
    period: "7-14 Hari",
  },

  {
    shapeName: "Gianyar",
    province: "Bali",
    rainfall: 82,
    status: "high",
    disease: "DBD",
    period: "7-14 Hari",
  },

];