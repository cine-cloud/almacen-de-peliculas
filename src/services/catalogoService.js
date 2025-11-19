import api from './api';

export const catalogoService = {
    // Listar todos los catálogos
    async listar() {
        try {
            const response = await api.get('/peliculas');
            return response.data;
        } catch (error) {
            console.error('Error al listar catálogos:', error);
            throw error;
        }
    },

    // Obtener un catálogo por ID
    obtener: async (id) => {
        try {
            const response = await api.get(`/catalogos/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener catálogo:', error);
            throw error;
        }
    },

    // Agregar película a catálogo
    agregarPelicula: async (catalogoId, peliculaId) => {
        try {
            const response = await api.post(`/catalogos/${catalogoId}/peliculas/${peliculaId}`);
            return response.data;
        } catch (error) {
            console.error('Error al agregar película al catálogo:', error);
            throw error;
        }
    },

    // Health check
    ping: async () => {
        try {
            const response = await api.get('/catalogos/ping');
            return response.data;
        } catch (error) {
            console.error('Error en ping:', error);
            throw error;
        }
    }
};
