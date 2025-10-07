const { classifyAqi } = require('../services/healthAdvisor');

const createRng = (seed = 123456789) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const slugify = (value) => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const baseCities = [
  { name: 'Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', isoCode: 'IN', region: 'Delhi', population: 32226000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 285, pm25: 125, pm10: 180, no2: 68, so2: 22, co: 2.8, o3: 85 } },
  { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', isoCode: 'IN', region: 'Maharashtra', population: 24983000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 155, pm25: 65, pm10: 95, no2: 45, so2: 15, co: 1.8, o3: 55 } },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India', isoCode: 'IN', region: 'Karnataka', population: 13707000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 95, pm25: 40, pm10: 65, no2: 38, so2: 12, co: 1.2, o3: 48 } },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India', isoCode: 'IN', region: 'West Bengal', population: 14974000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 175, pm25: 85, pm10: 120, no2: 52, so2: 18, co: 2.2, o3: 62 } },
  { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India', isoCode: 'IN', region: 'Tamil Nadu', population: 11325000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 115, pm25: 50, pm10: 78, no2: 42, so2: 14, co: 1.5, o3: 52 } },
  { name: 'Hyderabad', latitude: 17.385, longitude: 78.4867, country: 'India', isoCode: 'IN', region: 'Telangana', population: 10494000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 135, pm25: 58, pm10: 88, no2: 44, so2: 16, co: 1.7, o3: 58 } },
  { name: 'Pune', latitude: 18.5204, longitude: 73.8567, country: 'India', isoCode: 'IN', region: 'Maharashtra', population: 6837200, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 125, pm25: 55, pm10: 82, no2: 40, so2: 15, co: 1.6, o3: 54 } },
  { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, country: 'India', isoCode: 'IN', region: 'Gujarat', population: 8233000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 165, pm25: 75, pm10: 110, no2: 48, so2: 17, co: 2, o3: 60 } },
  { name: 'Surat', latitude: 21.1702, longitude: 72.8311, country: 'India', isoCode: 'IN', region: 'Gujarat', population: 6536700, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 145, pm25: 62, pm10: 92, no2: 43, so2: 16, co: 1.8, o3: 56 } },
  { name: 'Lucknow', latitude: 26.8467, longitude: 80.9462, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 3382000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 195, pm25: 95, pm10: 135, no2: 55, so2: 19, co: 2.4, o3: 65 } },
  { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, country: 'India', isoCode: 'IN', region: 'Rajasthan', population: 3073400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 185, pm25: 90, pm10: 130, no2: 54, so2: 18, co: 2.3, o3: 64 } },
  { name: 'Kanpur', latitude: 26.4499, longitude: 80.3319, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 3033000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 225, pm25: 110, pm10: 158, no2: 58, so2: 20, co: 2.6, o3: 70 } },
  { name: 'Nagpur', latitude: 21.1458, longitude: 79.0882, country: 'India', isoCode: 'IN', region: 'Maharashtra', population: 2405400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 138, pm25: 60, pm10: 89, no2: 45, so2: 16, co: 1.7, o3: 57 } },
  { name: 'Indore', latitude: 22.7196, longitude: 75.8577, country: 'India', isoCode: 'IN', region: 'Madhya Pradesh', population: 2557600, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 155, pm25: 68, pm10: 98, no2: 47, so2: 17, co: 1.9, o3: 59 } },
  { name: 'Bhopal', latitude: 23.2599, longitude: 77.4126, country: 'India', isoCode: 'IN', region: 'Madhya Pradesh', population: 1883300, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 142, pm25: 61, pm10: 91, no2: 44, so2: 15, co: 1.7, o3: 56 } },
  { name: 'Patna', latitude: 25.5941, longitude: 85.1376, country: 'India', isoCode: 'IN', region: 'Bihar', population: 2516100, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 205, pm25: 98, pm10: 142, no2: 56, so2: 19, co: 2.5, o3: 68 } },
  { name: 'Vadodara', latitude: 22.3072, longitude: 73.1812, country: 'India', isoCode: 'IN', region: 'Gujarat', population: 2067200, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 135, pm25: 58, pm10: 88, no2: 44, so2: 15, co: 1.7, o3: 55 } },
  { name: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 2405000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 235, pm25: 115, pm10: 165, no2: 60, so2: 21, co: 2.7, o3: 72 } },
  { name: 'Ludhiana', latitude: 30.901, longitude: 75.8573, country: 'India', isoCode: 'IN', region: 'Punjab', population: 2098800, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 175, pm25: 82, pm10: 118, no2: 51, so2: 18, co: 2.1, o3: 62 } },
  { name: 'Agra', latitude: 27.1767, longitude: 78.0081, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 2054400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 198, pm25: 92, pm10: 138, no2: 55, so2: 19, co: 2.4, o3: 66 } },
  { name: 'Faridabad', latitude: 28.4089, longitude: 77.3178, country: 'India', isoCode: 'IN', region: 'Haryana', population: 1801600, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 215, pm25: 102, pm10: 148, no2: 57, so2: 20, co: 2.6, o3: 69 } },
  { name: 'Meerut', latitude: 28.9845, longitude: 77.7064, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 1755800, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 195, pm25: 92, pm10: 135, no2: 54, so2: 19, co: 2.3, o3: 65 } },
  { name: 'Varanasi', latitude: 25.3176, longitude: 82.9739, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 1674300, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 188, pm25: 88, pm10: 128, no2: 53, so2: 18, co: 2.2, o3: 63 } },
  { name: 'Srinagar', latitude: 34.0837, longitude: 74.7973, country: 'India', isoCode: 'IN', region: 'Jammu and Kashmir', population: 1275400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 158, pm25: 72, pm10: 108, no2: 48, so2: 17, co: 2, o3: 60 } },
  { name: 'Amritsar', latitude: 31.634, longitude: 74.8723, country: 'India', isoCode: 'IN', region: 'Punjab', population: 1219600, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 165, pm25: 78, pm10: 112, no2: 49, so2: 17, co: 2, o3: 61 } },
  { name: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, country: 'India', isoCode: 'IN', region: 'Chandigarh', population: 1182400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 148, pm25: 68, pm10: 102, no2: 47, so2: 16, co: 1.9, o3: 59 } },
  { name: 'Guwahati', latitude: 26.1445, longitude: 91.7362, country: 'India', isoCode: 'IN', region: 'Assam', population: 1103200, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 125, pm25: 55, pm10: 85, no2: 43, so2: 15, co: 1.6, o3: 55 } },
  { name: 'Coimbatore', latitude: 11.0168, longitude: 76.9558, country: 'India', isoCode: 'IN', region: 'Tamil Nadu', population: 2437800, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 98, pm25: 42, pm10: 68, no2: 38, so2: 13, co: 1.3, o3: 48 } },
  { name: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185, country: 'India', isoCode: 'IN', region: 'Andhra Pradesh', population: 2284300, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 112, pm25: 48, pm10: 76, no2: 41, so2: 14, co: 1.4, o3: 51 } },
  { name: 'Raipur', latitude: 21.2514, longitude: 81.6296, country: 'India', isoCode: 'IN', region: 'Chhattisgarh', population: 1355000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 158, pm25: 72, pm10: 108, no2: 48, so2: 17, co: 2, o3: 60 } },
  { name: 'Madurai', latitude: 9.9252, longitude: 78.1198, country: 'India', isoCode: 'IN', region: 'Tamil Nadu', population: 1558900, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 102, pm25: 45, pm10: 72, no2: 39, so2: 14, co: 1.4, o3: 50 } },
  { name: 'Ranchi', latitude: 23.3441, longitude: 85.3096, country: 'India', isoCode: 'IN', region: 'Jharkhand', population: 1196000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 145, pm25: 65, pm10: 98, no2: 46, so2: 16, co: 1.8, o3: 58 } },
  { name: 'Jodhpur', latitude: 26.2389, longitude: 73.0243, country: 'India', isoCode: 'IN', region: 'Rajasthan', population: 1514400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 168, pm25: 78, pm10: 115, no2: 50, so2: 17, co: 2, o3: 61 } },
  { name: 'Mysuru', latitude: 12.2958, longitude: 76.6394, country: 'India', isoCode: 'IN', region: 'Karnataka', population: 1005400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 92, pm25: 40, pm10: 65, no2: 37, so2: 13, co: 1.2, o3: 47 } },
  { name: 'Vijayawada', latitude: 16.5062, longitude: 80.648, country: 'India', isoCode: 'IN', region: 'Andhra Pradesh', population: 1793700, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 122, pm25: 54, pm10: 82, no2: 42, so2: 15, co: 1.6, o3: 54 } },
  { name: 'Nashik', latitude: 19.9975, longitude: 73.7898, country: 'India', isoCode: 'IN', region: 'Maharashtra', population: 2011000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 128, pm25: 55, pm10: 84, no2: 42, so2: 15, co: 1.6, o3: 54 } },
  { name: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366, country: 'India', isoCode: 'IN', region: 'Kerala', population: 956000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 88, pm25: 36, pm10: 60, no2: 35, so2: 12, co: 1.1, o3: 46 } },
  { name: 'Dehradun', latitude: 30.3165, longitude: 78.0322, country: 'India', isoCode: 'IN', region: 'Uttarakhand', population: 1058200, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 118, pm25: 52, pm10: 80, no2: 41, so2: 14, co: 1.5, o3: 53 } },
  { name: 'Dhanbad', latitude: 23.7957, longitude: 86.4304, country: 'India', isoCode: 'IN', region: 'Jharkhand', population: 1174800, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 175, pm25: 82, pm10: 118, no2: 51, so2: 18, co: 2.1, o3: 62 } },
  { name: 'Udaipur', latitude: 24.5854, longitude: 73.7125, country: 'India', isoCode: 'IN', region: 'Rajasthan', population: 768000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 142, pm25: 62, pm10: 92, no2: 45, so2: 16, co: 1.8, o3: 57 } },
  { name: 'Hubballi', latitude: 15.3647, longitude: 75.124, country: 'India', isoCode: 'IN', region: 'Karnataka', population: 944000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 108, pm25: 48, pm10: 75, no2: 40, so2: 14, co: 1.5, o3: 52 } },
  { name: 'Gwalior', latitude: 26.2183, longitude: 78.1828, country: 'India', isoCode: 'IN', region: 'Madhya Pradesh', population: 1264400, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 172, pm25: 80, pm10: 118, no2: 51, so2: 18, co: 2.1, o3: 62 } },
  { name: 'Jabalpur', latitude: 23.1815, longitude: 79.9864, country: 'India', isoCode: 'IN', region: 'Madhya Pradesh', population: 1276200, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 138, pm25: 62, pm10: 92, no2: 45, so2: 16, co: 1.8, o3: 57 } },
  { name: 'Bareilly', latitude: 28.367, longitude: 79.4304, country: 'India', isoCode: 'IN', region: 'Uttar Pradesh', population: 1159500, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 178, pm25: 82, pm10: 122, no2: 52, so2: 18, co: 2.2, o3: 63 } },
  { name: 'Warangal', latitude: 17.9689, longitude: 79.5941, country: 'India', isoCode: 'IN', region: 'Telangana', population: 830000, timezone: 'Asia/Kolkata', isIndian: true, baseline: { aqi: 132, pm25: 58, pm10: 86, no2: 43, so2: 15, co: 1.7, o3: 55 } },
  // International anchor cities to diversify dataset
  { name: 'New York City', latitude: 40.7128, longitude: -74.006, country: 'United States', isoCode: 'US', region: 'New York', population: 19223191, timezone: 'America/New_York', isIndian: false, baseline: { aqi: 82, pm25: 25, pm10: 40, no2: 35, so2: 7, co: 0.6, o3: 30 } },
  { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', isoCode: 'GB', region: 'England', population: 9421200, timezone: 'Europe/London', isIndian: false, baseline: { aqi: 70, pm25: 20, pm10: 35, no2: 28, so2: 6, co: 0.5, o3: 26 } },
  { name: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'France', isoCode: 'FR', region: 'Île-de-France', population: 11020000, timezone: 'Europe/Paris', isIndian: false, baseline: { aqi: 78, pm25: 23, pm10: 38, no2: 30, so2: 6, co: 0.5, o3: 28 } },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', isoCode: 'JP', region: 'Kanto', population: 37468000, timezone: 'Asia/Tokyo', isIndian: false, baseline: { aqi: 65, pm25: 18, pm10: 32, no2: 25, so2: 5, co: 0.4, o3: 24 } },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'Australia', isoCode: 'AU', region: 'New South Wales', population: 5312163, timezone: 'Australia/Sydney', isIndian: false, baseline: { aqi: 60, pm25: 16, pm10: 28, no2: 20, so2: 4, co: 0.3, o3: 22 } },
  { name: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'Singapore', isoCode: 'SG', region: 'Singapore', population: 5703600, timezone: 'Asia/Singapore', isIndian: false, baseline: { aqi: 68, pm25: 22, pm10: 36, no2: 26, so2: 6, co: 0.4, o3: 25 } },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'United Arab Emirates', isoCode: 'AE', region: 'Dubai', population: 3331400, timezone: 'Asia/Dubai', isIndian: false, baseline: { aqi: 120, pm25: 48, pm10: 78, no2: 38, so2: 12, co: 1.2, o3: 45 } },
  { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, country: 'United States', isoCode: 'US', region: 'California', population: 12750807, timezone: 'America/Los_Angeles', isIndian: false, baseline: { aqi: 105, pm25: 38, pm10: 60, no2: 32, so2: 8, co: 0.9, o3: 40 } },
  { name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China', isoCode: 'CN', region: 'Beijing', population: 20154000, timezone: 'Asia/Shanghai', isIndian: false, baseline: { aqi: 160, pm25: 75, pm10: 110, no2: 50, so2: 18, co: 1.5, o3: 55 } },
  { name: 'Cape Town', latitude: -33.9249, longitude: 18.4241, country: 'South Africa', isoCode: 'ZA', region: 'Western Cape', population: 4603000, timezone: 'Africa/Johannesburg', isIndian: false, baseline: { aqi: 72, pm25: 22, pm10: 34, no2: 24, so2: 5, co: 0.4, o3: 26 } }
];

const determineDominantPollutant = (pollutants) => {
  const ranked = Object.entries(pollutants)
    .sort(([, a], [, b]) => b - a);
  return ranked[0][0];
};

const generateCityRecords = (targetCount, rng) => {
  const records = [];
  const variants = ['Central', 'North', 'South', 'East', 'West'];

  for (let i = 0; records.length < targetCount; i += 1) {
    const baseIndex = i % baseCities.length;
    const variationIndex = Math.floor(i / baseCities.length);
    const base = baseCities[baseIndex];

    const suffix = variationIndex === 0 ? '' : ` ${variants[(variationIndex - 1) % variants.length]}`;
    const name = suffix ? `${base.name} ${suffix}` : base.name;
    const slugBase = slugify(name);

    if (records.some(record => record.slug === slugBase)) {
      continue;
    }

    const jitterLat = base.latitude + (rng() - 0.5) * 0.6;
    const jitterLong = base.longitude + (rng() - 0.5) * 0.6;
    const populationNoise = Math.round(base.population * (0.9 + rng() * 0.2));

    const baselineNoiseFactor = 0.85 + rng() * 0.3;

    const baseline = Object.fromEntries(
      Object.entries(base.baseline).map(([key, value]) => [
        key,
        Number((value * baselineNoiseFactor * (0.95 + rng() * 0.1)).toFixed(2))
      ])
    );

    records.push({
      name,
      slug: slugBase,
      country: base.country,
      isoCode: base.isoCode,
      region: base.region,
      latitude: Number(jitterLat.toFixed(4)),
      longitude: Number(jitterLong.toFixed(4)),
      population: populationNoise,
      timezone: base.timezone,
      isIndian: !!base.isIndian,
      baseline
    });
  }

  return records;
};

const buildPollutionSamples = (city, hours, rng) => {
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const readings = [];

  for (let i = hours; i >= 0; i -= 1) {
    const recordedAt = new Date(now.getTime() - i * 60 * 60 * 1000);
    const seasonalNoise = Math.sin((i / 24) * Math.PI) * 10;
    const aqiBase = city.baseline.aqi + seasonalNoise + (rng() - 0.5) * 35;
    const aqi = Math.round(clamp(aqiBase, 25, 420));

    const pollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'].reduce((acc, key) => {
      const baselineValue = city.baseline[key];
      const variation = baselineValue * (0.7 + rng() * 0.6);
      acc[key] = Number(clamp(variation, 1, baselineValue * 1.8).toFixed(2));
      return acc;
    }, {});

    const dominantPollutant = determineDominantPollutant(pollutants);
    const category = classifyAqi(aqi);

    readings.push({
      citySlug: city.slug,
      recordedAt,
      aqi,
      aqiCategory: category.id,
      dominantPollutant,
      pm25: pollutants.pm25,
      pm10: pollutants.pm10,
      co: pollutants.co,
      no2: pollutants.no2,
      so2: pollutants.so2,
      o3: pollutants.o3,
      temperature: Number((18 + rng() * 15).toFixed(2)),
      humidity: Number((40 + rng() * 50).toFixed(2)),
      windSpeed: Number((2 + rng() * 12).toFixed(2)),
      dataSource: 'synthetic-model'
    });
  }

  return readings;
};

const buildDailySummaries = (cityId, readings, days) => {
  const summaries = [];
  const grouped = readings.reduce((acc, reading) => {
    const date = new Date(reading.recordedAt);
    const key = date.toISOString().slice(0, 10);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(reading);
    return acc;
  }, {});

  const dates = Object.keys(grouped)
    .sort()
    .slice(-days);

  dates.forEach((date, index) => {
    const dayReadings = grouped[date];
    const avgAqi = dayReadings.reduce((sum, reading) => sum + reading.aqi, 0) / dayReadings.length;
    const avgPollutants = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'].reduce((acc, key) => {
      acc[key] = dayReadings.reduce((sum, reading) => sum + reading[key], 0) / dayReadings.length;
      return acc;
    }, {});

    const dominantPollutant = determineDominantPollutant(avgPollutants);
    const trendPrev = summaries[index - 1]?.avgAqi || avgAqi;

    summaries.push({
      cityId,
      summaryDate: date,
      avgAqi: Number(avgAqi.toFixed(2)),
      maxAqi: Math.max(...dayReadings.map(reading => reading.aqi)),
      minAqi: Math.min(...dayReadings.map(reading => reading.aqi)),
      dominantPollutant,
      avgPm25: Number(avgPollutants.pm25.toFixed(2)),
      avgPm10: Number(avgPollutants.pm10.toFixed(2)),
      avgCo: Number(avgPollutants.co.toFixed(2)),
      avgNo2: Number(avgPollutants.no2.toFixed(2)),
      avgSo2: Number(avgPollutants.so2.toFixed(2)),
      avgO3: Number(avgPollutants.o3.toFixed(2)),
      trendScore: Number((avgAqi - trendPrev).toFixed(2))
    });
  });

  return summaries;
};

const generateSeedData = ({ targetCities = 160, hours = 120, days = 7 } = {}) => {
  const rng = createRng();
  const cities = generateCityRecords(targetCities, rng)
    .map((record, index) => ({
      id: index + 1,
      name: record.name,
      slug: record.slug,
      country: record.country,
      isoCode: record.isoCode,
      region: record.region,
      latitude: record.latitude,
      longitude: record.longitude,
      population: record.population,
      timezone: record.timezone,
      isIndian: record.isIndian,
      createdAt: new Date(),
      updatedAt: new Date(),
      baseline: record.baseline
    }));

  const baselineMap = new Map(cities.map(city => [city.slug, city.baseline]));

  const pollutionReadings = [];
  const dailySummaries = [];

  cities.forEach(city => {
    const baseline = baselineMap.get(city.slug) || baseCities[0].baseline;
    const readings = buildPollutionSamples({ ...city, baseline }, hours, rng);

    readings.forEach(reading => {
      pollutionReadings.push({
        cityId: city.id,
        recordedAt: reading.recordedAt,
        aqi: reading.aqi,
        aqiCategory: reading.aqiCategory,
        dominantPollutant: reading.dominantPollutant,
        pm25: reading.pm25,
        pm10: reading.pm10,
        co: reading.co,
        no2: reading.no2,
        so2: reading.so2,
        o3: reading.o3,
        temperature: reading.temperature,
        humidity: reading.humidity,
        windSpeed: reading.windSpeed,
        dataSource: reading.dataSource,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    const summaries = buildDailySummaries(city.id, readings, days).map(summary => ({
      ...summary,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    dailySummaries.push(...summaries);
  });

  const sanitizedCities = cities.map(({ baseline, ...rest }) => rest);

  return {
    cities: sanitizedCities,
    pollutionReadings,
    dailySummaries
  };
};

module.exports = {
  generateSeedData
};
