import axios from "axios";

const carritoApi = axios.create({
  baseURL: "http://localhost:8082",
});

export const carritoService = {
  crearCarrito: async (usuarioId) => {
    const response = await carritoApi.post(`/carritos/${usuarioId}`);
    return response.data;
  },

  agregarItem: async (idCarrito, peliculaId, cantidad = 1) => {
    const response = await carritoApi.post(
      `/carritos/agregar-item/${idCarrito}`,
      {
        peliculaId,
        cantidad,
      },
    );

    return response.data;
  },

  checkout: async (idCarrito) => {
    const response = await carritoApi.post(`/carritos/checkout/${idCarrito}`);

    return response.data;
  },
};
