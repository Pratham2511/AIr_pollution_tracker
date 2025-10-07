const AQI_CATEGORIES = [
  { max: 50, id: 'good', title: 'Good', message: 'Air quality is satisfactory. Enjoy your day outdoors!' },
  { max: 100, id: 'moderate', title: 'Moderate', message: 'Air quality is acceptable. Sensitive groups should limit vigorous outdoor activity.' },
  { max: 150, id: 'unhealthy_sensitive', title: 'Unhealthy for Sensitive Groups', message: 'Members of sensitive groups may experience health effects. Consider reducing prolonged exertion.' },
  { max: 200, id: 'unhealthy', title: 'Unhealthy', message: 'Everyone may begin to feel health effects; sensitive groups should avoid strenuous outdoor activity.' },
  { max: 300, id: 'very_unhealthy', title: 'Very Unhealthy', message: 'Health alert: everyone may experience more serious health effects. Stay indoors if possible.' },
  { max: Infinity, id: 'hazardous', title: 'Hazardous', message: 'Emergency conditions. Remain indoors with filtered air and avoid outdoor exposure.' }
];

const pollutantImpact = {
  pm25: 'Fine particles penetrate deep into lungs and bloodstream. Limit outdoor air exposure.',
  pm10: 'Coarse particles irritate lungs and eyes. Masks can help reduce irritation.',
  co: 'Carbon Monoxide lowers oxygen delivery. Avoid high traffic areas and ensure good ventilation.',
  no2: 'Nitrogen dioxide irritates airways. Consider indoor air purifiers.',
  so2: 'Sulfur dioxide can trigger asthma symptoms. Keep rescue medication nearby.',
  o3: 'Ground-level ozone inflames airways. Exercise indoors when possible.'
};

const classifyAqi = (aqi) => {
  return AQI_CATEGORIES.find(category => aqi <= category.max) || AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
};

const buildHealthAdvice = (aqi, dominantPollutant) => {
  const category = classifyAqi(aqi);
  const pollutantAdvice = pollutantImpact[dominantPollutant] || 'Follow general air quality guidelines and monitor sensitive symptoms.';

  return {
    category: category.id,
    title: category.title,
    description: category.message,
    pollutantAdvice,
    badgeClass: `health-${category.id.replace('_', '-')}`
  };
};

module.exports = {
  classifyAqi,
  buildHealthAdvice
};
