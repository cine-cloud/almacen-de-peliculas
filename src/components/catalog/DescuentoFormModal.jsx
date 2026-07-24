import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { descuentoService } from "@/services/descuentoService";

export default function DescuentoFormModal({ isOpen, onClose, onSave, descuento }) {
  const isEditing = !!descuento;

  const [formData, setFormData] = useState({
    codigo: "",
    descripcion: "",
    monto: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (descuento) {
        setFormData({
          codigo: descuento.codigo || "",
          descripcion: descuento.descripcion || "",
          monto: descuento.monto || "",
          fechaDesde: descuento.fechaDesde || "",
          fechaHasta: descuento.fechaHasta || "",
        });
      } else {
        setFormData({
          codigo: "",
          descripcion: "",
          monto: "",
          fechaDesde: new Date().toISOString().split("T")[0],
          fechaHasta: "",
        });
      }
      setError("");
    }
  }, [isOpen, descuento]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "codigo" ? value.toUpperCase().replace(/\s+/g, "") : value,
    }));
  };

  const validateForm = () => {
    if (!formData.codigo.trim()) {
      return "El código de descuento es obligatorio.";
    }
    if (!formData.descripcion.trim()) {
      return "La descripción es obligatoria.";
    }
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      return "El descuento debe ser un monto mayor a cero.";
    }
    if (parseFloat(formData.monto) > 100) {
      return "El porcentaje de descuento no puede ser mayor al 100%.";
    }
    if (!formData.fechaDesde) {
      return "La fecha de inicio es obligatoria.";
    }
    if (!formData.fechaHasta) {
      return "La fecha de finalización es obligatoria.";
    }
    if (new Date(formData.fechaHasta) < new Date(formData.fechaDesde)) {
      return "La fecha de finalización debe ser posterior o igual a la fecha de inicio.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        codigo: formData.codigo.trim(),
        descripcion: formData.descripcion.trim(),
        monto: parseFloat(formData.monto),
        fechaDesde: formData.fechaDesde,
        fechaHasta: formData.fechaHasta,
      };

      if (isEditing) {
        await descuentoService.editar(descuento.id, payload);
      } else {
        await descuentoService.crear(payload);
      }

      onSave();
      onClose();
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        "Ocurrió un error al procesar la solicitud. Verifica que el código no esté duplicado.";
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-base-100 border border-border rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-secondary text-secondary-content">
          <h2 id="modal-title" className="text-lg font-bold">
            {isEditing ? "Editar Descuento" : "Crear Nuevo Descuento"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="alert alert-error text-sm py-2 px-3 rounded-lg flex items-start gap-1">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Código */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-accent">Código de Cupón</span>
            </label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: PRIMAVERA15"
              className="input input-bordered w-full font-mono focus:input-primary text-accent bg-base-100"
              disabled={isEditing} // Generalmente los códigos no se editan una vez creados para evitar problemas de consistencia
              maxLength={30}
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-accent">Descripción</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Disfruta un 15% de descuento en todas las películas durante julio"
              className="textarea textarea-bordered w-full focus:textarea-primary min-h-[80px] text-accent bg-base-100"
              maxLength={255}
              required
            />
          </div>

          {/* Monto (Porcentaje) */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-accent">Descuento (%)</span>
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="Ej: 15"
              min="1"
              max="100"
              step="0.01"
              className="input input-bordered w-full focus:input-primary text-accent bg-base-100"
              required
            />
          </div>

          {/* Fechas (Rango) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-accent">Fecha Inicio</span>
              </label>
              <input
                type="date"
                name="fechaDesde"
                value={formData.fechaDesde}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary text-accent bg-base-100"
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-accent">Fecha Fin</span>
              </label>
              <input
                type="date"
                name="fechaHasta"
                value={formData.fechaHasta}
                onChange={handleChange}
                className="input input-bordered w-full focus:input-primary text-accent bg-base-100"
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost hover:bg-black/5 text-accent cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Guardando...
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Crear Descuento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
