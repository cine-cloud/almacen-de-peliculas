import axios from "axios";
import { attachAuthInterceptor } from "@/services/api/auth";

const descuentoApi = axios.create({
  baseURL: "http://localhost:8084",
});

attachAuthInterceptor(descuentoApi);

export const descuentoService = {
  listarActivos: async () => {
    try {
      const response = await descuentoApi.get("/descuentos");
      return response.data;
    } catch (error) {
      console.error("Error al listar descuentos activos:", error);
      throw error;
    }
  },

  listarTodos: async () => {
    try {
      const response = await descuentoApi.get("/descuentos/todos");
      return response.data;
    } catch (error) {
      console.error("Error al listar todos los descuentos:", error);
      throw error;
    }
  },

  obtenerDetalle: async (id) => {
    try {
      const response = await descuentoApi.get(`/descuentos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener detalle del descuento ${id}:`, error);
      throw error;
    }
  },

  crear: async (descuentoData) => {
    try {
      const response = await descuentoApi.post("/descuentos", descuentoData);
      return response.data;
    } catch (error) {
      console.error("Error al crear descuento:", error);
      throw error;
    }
  },

  editar: async (id, descuentoData) => {
    try {
      const response = await descuentoApi.put(`/descuentos/${id}`, descuentoData);
      return response.data;
    } catch (error) {
      console.error(`Error al editar descuento ${id}:`, error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await descuentoApi.delete(`/descuentos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar descuento ${id}:`, error);
      throw error;
    }
  },
};

export default descuentoService;
