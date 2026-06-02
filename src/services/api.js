import axios from "axios";

// Se crea instancia base
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

//Función para setear token dinámicamente
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;