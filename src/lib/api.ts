import axios from "axios";

const MOCK_TOKEN = "mock-user-token"; 

const api = axios.create();

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${MOCK_TOKEN}`;
  return config;
});

export default api;
