import keycloak from "@/config/keycloak";

/**
 * Verifica si la petición es un endpoint de lectura pública
 * (Listar películas, ver detalle de película, géneros, actores, directores).
 */
const isPublicReadRequest = (config) => {
  const method = config.method?.toLowerCase();
  const url = config.url || "";

  if (method !== "get") {
    return false;
  }

  const publicPatterns = [
    /^\/peliculas\/?$/,
    /^\/peliculas\/\d+$/,
    /^\/generos\/?$/,
    /^\/actores\/?$/,
    /^\/directores\/?$/
  ];

  return publicPatterns.some((pattern) => pattern.test(url));
};

/**
 * Interceptor único y unificado para la cabecera de autenticación.
 * Setea 'Authorization: Bearer <token>' a todas las peticiones,
 * EXCEPTO a los endpoints que listan películas o acceden a su detalle.
 */
export const attachAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = keycloak?.token;

      if (isPublicReadRequest(config)) {
        delete config.headers.Authorization;
        return config;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

export const setAuthToken = (token) => {
  // Mantiene compatibilidad con invocaciones desde KeycloakProvider
  if (!token) {
    delete keycloak.token;
  }
};