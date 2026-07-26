import carritoApi from "./api/carritoApi";

export const carritoService = {
  crearCarrito: async (usuarioId) => {
    const response = await carritoApi.post(`/carritos/${usuarioId}`);
    return response.data;
  },

  crearCarritoAnonimo: async () => {
    const response = await carritoApi.post("/carritos");
    return response.data;
  },

  asociarOFusionar: async (idCarrito, usuarioId) => {
    const response = await carritoApi.put(
      `/carritos/${idCarrito}/fusionar/${usuarioId}`,
    );

    return response.data;
  },

  obtenerCarrito: async (idCarrito) => {
    const response = await carritoApi.get(`/carritos/${idCarrito}`);
    return response.data;
  },

  obtenerCarritoUsuario: async (usuarioId) => {
    const response = await carritoApi.get(`/carritos/usuario/${usuarioId}`);
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

  actualizarCantidad: async (idCarrito, peliculaId, cantidad) => {
    const response = await carritoApi.put(
      `/carritos/actualizar-cantidad/${idCarrito}`,
      {
        peliculaId,
        cantidad,
      },
    );

    return response.data;
  },

  eliminarItem: async (idCarrito, peliculaId) => {
    const response = await carritoApi.delete(
      `/carritos/eliminar-item/${idCarrito}`,
      {
        data: {
          peliculaId,
        },
      },
    );

    return response.data;
  },

  asociarUsuario: async (idCarrito, usuarioId) => {
    const response = await carritoApi.put(
      `/carritos/${idCarrito}/usuario/${usuarioId}`,
    );

    return response.data;
  },

  checkout: async (idCarrito, descuentoMonto, codigoDescuento) => {
    let url = `/carritos/checkout/${idCarrito}`;
    const params = new URLSearchParams();
    if (descuentoMonto != null) params.append("descuentoMonto", descuentoMonto);
    if (codigoDescuento) params.append("codigoDescuento", codigoDescuento);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await carritoApi.post(url);

    return response.data;
  },
};
