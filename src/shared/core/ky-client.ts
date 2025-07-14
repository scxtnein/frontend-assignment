import ky from 'ky';

const API_BASE_URL = 'http://localhost:4090';

export const kyClient = ky.create({
  prefixUrl: API_BASE_URL,
  cache: 'no-store',
  retry: 0,
  timeout: 120_000,
});
