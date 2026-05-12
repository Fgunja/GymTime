import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuth } from "src/auth";

const api = axios.create({ baseURL: "https://api.example.com" });

export default boot(({ app }) => {
  // Automatski dodaj JWT token na svaki request
  axios.interceptors.request.use((config) => {
    const auth = useAuth();
    const token = auth.state.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
