export const getAllowedOrigins = () => {
  const configuredOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URLS,
    process.env.CORS_ALLOWED_ORIGINS
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([
    ...configuredOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ])];
};
