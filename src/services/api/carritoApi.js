import axios from "axios";
import { attachAuthInterceptor } from "./auth";

const carritoApi = axios.create({
  baseURL: "http://localhost:8080",
});

attachAuthInterceptor(carritoApi);

export default carritoApi;