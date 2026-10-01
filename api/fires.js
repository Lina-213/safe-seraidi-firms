export default async function handler(req, res) {
  try {
    const MAP_KEY = process.env.FIRMS_MAP_KEY;

    const url =
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_NOAA21_NRT/6.90,36.85,7.00,36.95/1`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "NASA FIRMS request failed"
      });
    }

    const csv = await response.text();

    const lines = csv.trim().split("\n");

    if (lines.length < 2) {
      return res.status(200).json({ fires: [] });
    }

    const headers = lines[0].split(",");

    const fires = lines.slice(1).map(line => {
      const values = line.split(",");

      const fire = {};

      headers.forEach((header, index) => {
        fire[header.trim()] = values[index]?.trim() || null;
      });

      return {
        latitude: Number(fire.latitude),
        longitude: Number(fire.longitude),
        confidence: fire.confidence,
        date: fire.acq_date,
        time: fire.acq_time
      };
    });

    return res.status(200).json({ fires });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
