import api from "./api/api";

export const peliculaService = {
  // Listar todas las películas

  listar: async () => {
    try {
      const response = await api.get("/peliculas");
      return response.data;
    } catch (error) {
      console.error("Error al listar películas:", error);
      throw error;
    }
  },

  // Obtener detalle de una película
  obtenerDetalle: async (id) => {
    try {
      const response = await api.get(`/peliculas/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener película:", error);
      throw error;
    }
  },

  obtenerActores: async () => {
    try {
      const response = await api.get("/actores");
      return response.data;
    } catch (error) {
      console.error("Error al obtener actores:", error);
      throw error;
    }
  },

  obtenerDirectores: async () => {
    try {
      const response = await api.get("/directores");
      return response.data;
    } catch (error) {
      console.error("Error al obtener directores:", error);
      throw error;
    }
  },

  obtenerGeneros: async () => {
     try {
    const response = await api.get("/generos");
    return response.data;
    } catch (error) {
      console.error("Error al obtener generos:", error);
      throw error;
    }
  },

  // Crea nueva película
  crear: async (peliculaData) => {
    try {
      const response = await api.post("/peliculas", peliculaData);
      return response.data;
    } catch (error) {
      console.error("Error al crear película:", error);
      throw error;
    }
  },

  // Editar película existente
  editar: async (id, peliculaData) => {
    try {
      const response = await api.put(`/peliculas/${id}`, peliculaData);
      return response.data;
    } catch (error) {
      console.error("Error al editar película:", error);
      throw error;
    }
  },

  // Actualizar stock de una película
  actualizarStock: async (id, stock) => {
    try {
      await api.put(`/peliculas/${id}/stock`, {
        stock: stock,
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      throw error;
    }
  },
};
