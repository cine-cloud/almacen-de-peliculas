import axios from "axios";
import { attachAuthInterceptor } from "@/services/api/auth";

const ratingApi = axios.create({
  baseURL: "http://localhost:8080/api/ratings",
});

attachAuthInterceptor(ratingApi);

export const ratingService = {
  votar: async (ratingData) => {
    try {
      const response = await ratingApi.post("", ratingData);
      return response.data;
    } catch (error) {
      console.error("Error al publicar la calificación:", error);
      throw error;
    }
  },

  haVotadoUsuario: async (peliculaId, usuarioId) => {
    try {
      const response = await ratingApi.get(`/pelicula/${peliculaId}/usuario/${usuarioId}/ha-votado`);
      return response.data;
    } catch (error) {
      console.error(`Error al verificar si el usuario ${usuarioId} votó la película ${peliculaId}:`, error);
      return { peliculaId, usuarioId, haVotado: false };
    }
  },

  obtenerVotoUsuario: async (peliculaId, usuarioId) => {
    try {
      const response = await ratingApi.get(`/pelicula/${peliculaId}/usuario/${usuarioId}/voto`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener voto del usuario ${usuarioId} en película ${peliculaId}:`, error);
      return null;
    }
  },

  obtenerPorPelicula: async (peliculaId) => {
    try {
      const response = await ratingApi.get(`/pelicula/${peliculaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener reseñas de la película ${peliculaId}:`, error);
      return [];
    }
  },

  obtenerPromedioPorPelicula: async (peliculaId) => {
    try {
      const response = await ratingApi.get(`/pelicula/${peliculaId}/promedio`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener promedio de película ${peliculaId}:`, error);
      return { peliculaId, promedio: 0.0, totalVotos: 0 };
    }
  },
};

export default ratingService;
