export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
export const API_URL = `${BASE_URL}/api`;

console.log('🔹 Configured API URL:', API_URL);
console.log('🔹 Configured Socket URL:', SOCKET_URL);
