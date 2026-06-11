export default function MapLegend() {

  return (

    <div
      className="
        absolute
        bottom-6
        right-6
        bg-white
        rounded-2xl
        shadow-lg
        border
        border-slate-200
        p-4
        z-10
      "
    >

      <h4
        className="
          font-bold
          text-slate-900
          mb-3
        "
      >
        Tingkat Risiko
      </h4>

      <div className="space-y-2">

        <div className="flex items-center gap-3">

          <div
            className="
              w-4
              h-4
              rounded-full
              bg-green-500
            "
          />

          <span>Aman</span>

        </div>

        <div className="flex items-center gap-3">

          <div
            className="
              w-4
              h-4
              rounded-full
              bg-yellow-500
            "
          />

          <span>Waspada</span>

        </div>

        <div className="flex items-center gap-3">

          <div
            className="
              w-4
              h-4
              rounded-full
              bg-red-500
            "
          />

          <span>Risiko Tinggi</span>

        </div>

      </div>

    </div>

  );

}