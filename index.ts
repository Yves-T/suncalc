import { InfluxDB, Point, HttpError } from "@influxdata/influxdb-client";
import { hostname } from "node:os";
import "dotenv/config";
import sunCalcPkg from "suncalc";
import express from "express";

console.log(process.env);

const app = express();
const port = 3005;

// env variables
const url = process.env.INFLUX_URL || "";
const token = process.env.INFLUX_TOKEN || "";
const org = process.env.INFLUX_ORG || "";
const bucket = process.env.BUCKET || "";
const lat: number = parseFloat(process.env.LAT || "");
const long: number = parseFloat(process.env.LONG || "");

const { getTimes } = sunCalcPkg;

async function writePoints(times: sunCalcPkg.GetTimesResult, date: Date) {
  console.log("*** WRITE POINTS ***");
  // create a write API, expecting point timestamps in nanoseconds (can be also 's', 'ms', 'us')
  const writeApi = new InfluxDB({ url, token }).getWriteApi(org, bucket, "ns");
  // setup default tags for all writes through this API
  writeApi.useDefaultTags({ location: hostname() });

  const nadirPoint = new Point("nadir")
    .floatField("value", times.nadir.getTime() / 1000)
    .timestamp(new Date(times.nadir));
  writeApi.writePoint(nadirPoint);
  console.log(` ${nadirPoint.toLineProtocol(writeApi)}`);

  const solarNoonPoint = new Point("solarNoon")
    .floatField("value", times.solarNoon.getTime() / 1000)
    .timestamp(new Date(times.solarNoon));
  writeApi.writePoint(solarNoonPoint);
  console.log(` ${solarNoonPoint.toLineProtocol(writeApi)}`);

  const sunrisePoint = new Point("sunrise")
    .floatField("value", times.sunrise.getTime() / 1000)
    .timestamp(new Date(times.sunrise));
  writeApi.writePoint(sunrisePoint);
  console.log(` ${sunrisePoint.toLineProtocol(writeApi)}`);

  const sunsetPoint = new Point("sunset")
    .floatField("value", times.sunset.getTime() / 1000)
    .timestamp(new Date(times.sunset));
  writeApi.writePoint(sunsetPoint);
  console.log(` ${sunsetPoint.toLineProtocol(writeApi)}`);

  const goldenHourEndPoint = new Point("goldenHourEnd")
    .floatField("value", times.goldenHourEnd.getTime() / 1000)
    .timestamp(new Date(times.goldenHourEnd));
  writeApi.writePoint(goldenHourEndPoint);
  console.log(` ${goldenHourEndPoint.toLineProtocol(writeApi)}`);

  const goldenHourPoint = new Point("goldenHour")
    .floatField("value", times.goldenHour.getTime() / 1000)
    .timestamp(new Date(times.goldenHour));
  writeApi.writePoint(goldenHourPoint);
  console.log(` ${goldenHourPoint.toLineProtocol(writeApi)}`);

  const lastUpdated = new Point("lastUpdated").floatField(
    "value",
    date.getTime() / 1000
  );
  writeApi.writePoint(lastUpdated);
  console.log(` ${lastUpdated.toLineProtocol(writeApi)}`);

  try {
    await writeApi.close();
    console.log("FINISHED ...");
  } catch (e) {
    console.error(e);
    if (e instanceof HttpError && e.statusCode === 401) {
      console.log("error: influx db not found");
    }
    console.log("\nFinished ERROR");
  }
}

app.get("/", (req, res) => {
  const date = new Date(new Date().toUTCString());
  const times = getTimes(date, lat, long);

  writePoints(times, date)
    .then(() => {
      res.json({ message: "write points success", times });
    })
    .catch(() => res.status(500).json({ error: "write points failed" }));
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
