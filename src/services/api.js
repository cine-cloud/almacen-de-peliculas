import axios from 'axios';
import keycloak from '../config/keycloak';

const api = axios.create({
    baseURL: 'http://localhost:9500/api',
});

api.interceptors.request.use((config) => {
    if (keycloak.authenticated && keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
});

// Interceptor para manejar tokens expirados
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && keycloak.authenticated) {
            try {
                const refreshed = await keycloak.updateToken(30);
                if (refreshed) {
                    // Reintentar la petición original con el nuevo token
                    error.config.headers.Authorization = `Bearer ${keycloak.token}`;
                    return api.request(error.config);
                } else {
                    keycloak.login();
                }
            } catch (refreshError) {
                keycloak.login();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
