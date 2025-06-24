// src/config.js
const baseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://api.ambulance.jetserveaviation.com'
    : 'http://localhost:4000';

export default baseUrl;
