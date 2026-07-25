import axios from "axios";
import { attachAuthInterceptor } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

attachAuthInterceptor(api);

export default api;