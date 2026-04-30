export const formatLocation = (location, fallback = 'Location unavailable') => {
  if (!location) return fallback;

  if (typeof location === 'string') {
    const trimmed = location.trim();
    return trimmed || fallback;
  }

  if (typeof location === 'object') {
    const parts = [
      location.address,
      location.city,
      location.state,
      location.country
    ].filter((part) => typeof part === 'string' && part.trim());

    return parts.length ? parts.join(', ') : fallback;
  }

  return fallback;
};
