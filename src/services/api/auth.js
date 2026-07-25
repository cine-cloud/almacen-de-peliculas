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
 * Refresca el token automáticamente si está por expirar.
 */
export const attachAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      // 1. Si es lectura pública, omitir token
      if (isPublicReadRequest(config)) {
        delete config.headers.Authorization;
        return config;
      }

      // 2. Si hay sesión activa en Keycloak, refrescar token antes de enviar la petición si va a expirar
      if (keycloak && keycloak.authenticated) {
        try {
          if (keycloak.isTokenExpired(30)) {
            await keycloak.updateToken(30);
          }
        } catch (err) {
          console.warn("Token de Keycloak expirado y no se pudo refrescar:", err);
        }

        if (keycloak.token) {
          config.headers.Authorization = `Bearer ${keycloak.token}`;
        } else {
          delete config.headers.Authorization;
        }
      } else if (keycloak?.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } else {
        delete config.headers.Authorization;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de respuesta para manejar posibles 401 por expiración extrema
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && keycloak && keycloak.authenticated) {
        try {
          // Intentar forzar actualización del token si devolvió 401
          const refreshed = await keycloak.updateToken(-1);
          if (refreshed && error.config) {
            error.config.headers.Authorization = `Bearer ${keycloak.token}`;
            return axiosInstance(error.config);
          }
        } catch (refreshErr) {
          console.error("Sesión de Keycloak expirada definitivamente.", refreshErr);
        }
      }
      return Promise.reject(error);
    }
  );
};

export const setAuthToken = (token) => {
  if (!token) {
    delete keycloak.token;
  }
};