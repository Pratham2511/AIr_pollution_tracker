const { Op } = require('sequelize');

const { City, PollutionReading, CityDailySummary } = require('../models');
const { buildHealthAdvice, classifyAqi } = require('./healthAdvisor');

const HOURS_LOOKBACK = 72;
const DAYS_LOOKBACK = 30;

const average = (values = []) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const sum = (values = []) => values.reduce((total, value) => total + value, 0);

const createEmptyOverview = () => ({
  cities: [],
  averagePollutants: {
    pm25: 0,
    pm10: 0,
    co: 0,
    no2: 0,
    so2: 0,
    o3: 0
  },
  categoryDistribution: {},
  regionalCorrelation: [],
  rankings: {
    worst: null,
    best: null,
    mostImproved: []
  },
  threeDayAggregateChange: []
});

const getCityAnalytics = async (slug) => {
  const city = await City.findOne({ where: { slug } });
  if (!city) {
    return null;
  }

  const lookbackStart = new Date(Date.now() - HOURS_LOOKBACK * 60 * 60 * 1000);
  const extendedLookback = new Date(Date.now() - DAYS_LOOKBACK * 24 * 60 * 60 * 1000);

  const [recentReadings, longWindowReadings, dailySummaries] = await Promise.all([
    PollutionReading.findAll({
      where: {
        cityId: city.id,
        recordedAt: {
          [Op.gte]: lookbackStart
        }
      },
      order: [['recordedAt', 'ASC']]
    }),
    PollutionReading.findAll({
      where: {
        cityId: city.id,
        recordedAt: {
          [Op.gte]: extendedLookback
        }
      },
      order: [['recordedAt', 'ASC']]
    }),
    CityDailySummary.findAll({
      where: { cityId: city.id },
      order: [['summaryDate', 'DESC']],
      limit: 7
    })
  ]);

  const latestReading = recentReadings.slice(-1)[0] || longWindowReadings.slice(-1)[0] || null;

  const pollutantSnapshot = latestReading ? {
    pm25: Number(latestReading.pm25.toFixed(2)),
    pm10: Number(latestReading.pm10.toFixed(2)),
    co: Number(latestReading.co.toFixed(2)),
    no2: Number(latestReading.no2.toFixed(2)),
    so2: Number(latestReading.so2.toFixed(2)),
    o3: Number(latestReading.o3.toFixed(2))
  } : null;

  const aqiTrend = recentReadings.map(reading => ({
    timestamp: reading.recordedAt,
    aqi: reading.aqi
  }));

  const hourlyBuckets = Array.from({ length: 24 }, () => []);
  const weekdayBuckets = Array.from({ length: 7 }, () => []);

  longWindowReadings.forEach(reading => {
    const date = new Date(reading.recordedAt);
    hourlyBuckets[date.getHours()].push(reading.aqi);
    weekdayBuckets[date.getDay()].push(reading.aqi);
  });

  const hourlyPattern = hourlyBuckets.map((bucket, hour) => ({
    hour,
    averageAqi: Number(average(bucket).toFixed(2))
  }));

  const weekdayPattern = weekdayBuckets.map((bucket, weekday) => ({
    weekday,
    averageAqi: Number(average(bucket).toFixed(2))
  }));

  const improvementTracker = dailySummaries
    .slice(0, 3)
    .map(summary => ({
      date: summary.summaryDate,
      avgAqi: Number(summary.avgAqi.toFixed(2)),
      trendScore: Number(summary.trendScore.toFixed(2)),
      dominantPollutant: summary.dominantPollutant
    }))
    .reverse();

  const dominantPollutant = latestReading?.dominantPollutant || improvementTracker.slice(-1)[0]?.dominantPollutant || 'pm25';
  const healthImpact = latestReading
    ? buildHealthAdvice(latestReading.aqi, dominantPollutant)
    : improvementTracker.length
      ? buildHealthAdvice(improvementTracker.slice(-1)[0].avgAqi, dominantPollutant)
      : null;

  return {
    city: {
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      isIndian: city.isIndian
    },
    aqiTrend,
    pollutantSnapshot,
    dominantPollutant,
    healthImpact,
    hourlyPattern,
    weekdayPattern,
    improvementTracker,
    latestReading: latestReading ? {
      aqi: latestReading.aqi,
      recordedAt: latestReading.recordedAt
    } : null
  };
};

const buildOverallAnalytics = async (cityIds) => {
  const whereClause = cityIds?.length ? { id: { [Op.in]: cityIds } } : {};

  const cities = await City.findAll({
    where: whereClause,
    limit: cityIds?.length ? undefined : 20
  });

  if (!cities.length) {
    return createEmptyOverview();
  }

  const cityIdsForSummaries = cities.map(city => city.id);
  const summaries = cityIdsForSummaries.length
    ? await CityDailySummary.findAll({
        where: {
          cityId: { [Op.in]: cityIdsForSummaries }
        },
        order: [['summaryDate', 'DESC']]
      })
    : [];

  const latestSummaryByCity = new Map();
  summaries.forEach(summary => {
    if (!latestSummaryByCity.has(summary.cityId)) {
      latestSummaryByCity.set(summary.cityId, summary);
    }
  });

  const multiCityAqi = cities.map(city => {
    const summary = latestSummaryByCity.get(city.id);
    return {
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      region: city.region,
      aqi: summary ? summary.avgAqi : 0
    };
  }).sort((a, b) => b.aqi - a.aqi);

  const pollutantTotals = {
    pm25: 0, pm10: 0, co: 0, no2: 0, so2: 0, o3: 0
  };
  let pollutantCount = 0;

  summaries.forEach(summary => {
    pollutantTotals.pm25 += summary.avgPm25;
    pollutantTotals.pm10 += summary.avgPm10;
    pollutantTotals.co += summary.avgCo;
    pollutantTotals.no2 += summary.avgNo2;
    pollutantTotals.so2 += summary.avgSo2;
    pollutantTotals.o3 += summary.avgO3;
    pollutantCount += 1;
  });

  const averagePollutants = Object.fromEntries(
    Object.entries(pollutantTotals).map(([key, value]) => [key, pollutantCount ? Number((value / pollutantCount).toFixed(2)) : 0])
  );

  const categoryDistribution = cities.reduce((acc, city) => {
    const summary = latestSummaryByCity.get(city.id);
    const aqi = summary ? summary.avgAqi : 0;
    const category = classifyAqi(aqi).id;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const regionGroups = cities.reduce((acc, city) => {
    const regionKey = city.region || city.country;
    if (!acc[regionKey]) {
      acc[regionKey] = [];
    }
    const summary = latestSummaryByCity.get(city.id);
    if (summary) {
      acc[regionKey].push(summary.avgAqi);
    }
    return acc;
  }, {});

  const regionalCorrelation = Object.entries(regionGroups).map(([region, values]) => ({
    region,
    averageAqi: Number(average(values).toFixed(2))
  })).sort((a, b) => b.averageAqi - a.averageAqi);

  const threeDayAggregateChange = [];
  const recentDates = [...new Set(summaries.map(summary => summary.summaryDate))].slice(0, 3);

  recentDates.reverse().forEach(date => {
    const matchingSummaries = summaries.filter(summary => summary.summaryDate === date);
    if (matchingSummaries.length) {
      const avg = average(matchingSummaries.map(summary => summary.avgAqi));
      threeDayAggregateChange.push({ date, avgAqi: Number(avg.toFixed(2)) });
    }
  });

  const bestCity = multiCityAqi.slice(-1)[0] || null;
  const worstCity = multiCityAqi[0] || null;

  const mostImproved = summaries
    .filter(summary => summary.trendScore < 0)
    .sort((a, b) => a.trendScore - b.trendScore)
    .slice(0, 3)
    .map(summary => ({
      cityId: summary.cityId,
      cityName: cities.find(city => city.id === summary.cityId)?.name || 'Unknown',
      trendScore: Number(summary.trendScore.toFixed(2))
    }));

  return {
    cities: multiCityAqi,
    averagePollutants,
    categoryDistribution,
    regionalCorrelation,
    rankings: {
      worst: worstCity,
      best: bestCity,
      mostImproved
    },
    threeDayAggregateChange
  };
};

module.exports = {
  getCityAnalytics,
  buildOverallAnalytics,
  createEmptyOverview
};
