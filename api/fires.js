export default async function handler(req, res) {
  try {
    const mapKey = process.env.FIRMS_MAP_KEY;

    if (!mapKey) {
      return res.status(500).json({
        error: "FIRMS_MAP_KEY is not configured"
      });
    }

    const nasaUrl =
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_NOAA21_NRT/6.90,36.85,7.00,36.95/1`;

    const response = await fetch(nasaUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "NASA FIRMS request failed",
        status: response.status
      });
    }

    const csv = await response.text();

    const lines = csv.trim().split(/\r?\n/);

    if (lines.length <= 1) {
      return res.status(200).json({
        fires: []
      });
    }

    const headers = lines[0].split(",");

    const fires = lines.slice(1).map(line => {
      const values = line.split(",");

      const row = {};

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() ?? null;
      });

      return {
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        confidence: row.confidence,
        date: row.acq_date,
        time: row.acq_time
      };
    });

    return res.status(200).json({ fires });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
