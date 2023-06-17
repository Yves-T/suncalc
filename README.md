# suncalc

Calculates sunlight phases and store it in influx DB

## Setup

You need to create a .env file in project root with

- LAT=your latitude
- LONG=your longitude
- INFLUX_URL="http://url_to_influxDB"
- INFLUX_TOKEN="your_influx_token"
- INFLUX_ORG="your_influx_org"
- BUCKET="your_bucket"

## Dev

Run `npm start compile` and start developing. TSC will put the compiled javascript in the dist folder