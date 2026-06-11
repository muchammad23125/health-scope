const fs = require("fs");
const path = require("path");
const turf = require("@turf/turf");

const geojsonPath = path.join(
  process.cwd(),
  "public",
  "data",
  "indonesia.geojson"
);

const outputPath = path.join(
  process.cwd(),
  "public",
  "data",
  "district-centroids.json"
);

try {

  const geojson = JSON.parse(
    fs.readFileSync(
      geojsonPath,
      "utf8"
    )
  );

  const centroids =
    geojson.features.map(
      (feature) => {

        const center =
          turf.centroid(feature);

        return {

          shapeName:
            feature.properties
              ?.shapeName || "",

          shapeID:
            feature.properties
              ?.shapeID || "",

          shapeType:
            feature.properties
              ?.shapeType || "",

          latitude:
            center.geometry
              .coordinates[1],

          longitude:
            center.geometry
              .coordinates[0],

        };

      }
    );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      centroids,
      null,
      2
    )
  );

  console.log(
    `✅ Berhasil generate ${centroids.length} centroid`
  );

  console.log(
    `📄 File tersimpan di: ${outputPath}`
  );

} catch (error) {

  console.error(
    "❌ Error:",
    error
  );

}