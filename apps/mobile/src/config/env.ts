const withProtocol = (value: string, fallback: string) => {
  const candidate = value || fallback;
  return candidate.startsWith('http://') || candidate.startsWith('https://') ? candidate : `http://${candidate}`;
};

export const env = {
  apiUrl: withProtocol(process.env.EXPO_PUBLIC_API_URL || '', 'http://localhost:5000/api'),
  socketUrl: withProtocol(process.env.EXPO_PUBLIC_SOCKET_URL || '', 'http://localhost:5000')
};
