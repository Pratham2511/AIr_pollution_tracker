const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'rediffmail.com',
  'proton.me',
  'protonmail.com',
  'aol.com'
];

const DOMAIN_SYNONYMS = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahho.com': 'yahoo.com',
  'hotnail.com': 'hotmail.com',
  'homail.com': 'hotmail.com',
  'outllok.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'icloud.co': 'icloud.com',
  'redifmail.com': 'rediffmail.com'
};

const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a || !b) return (a || b).length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
};

const suggestEmailCorrection = (email = '') => {
  if (!email.includes('@')) {
    return null;
  }

  const [localPart, domainPartRaw] = email.split('@');
  if (!domainPartRaw) {
    return null;
  }

  const domainPart = domainPartRaw.toLowerCase();

  if (DOMAIN_SYNONYMS[domainPart]) {
    return `${localPart}@${DOMAIN_SYNONYMS[domainPart]}`;
  }

  let closestDomain = null;
  let smallestDistance = Infinity;

  for (const candidate of COMMON_DOMAINS) {
    const distance = levenshtein(domainPart, candidate);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestDomain = candidate;
    }
  }

  if (closestDomain && smallestDistance <= 2 && closestDomain !== domainPart) {
    return `${localPart}@${closestDomain}`;
  }

  return null;
};

module.exports = {
  suggestEmailCorrection
};
