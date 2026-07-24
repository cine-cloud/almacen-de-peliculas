import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Plus, Edit2, Trash2, Tag, Copy, Check } from "lucide-react";
import { useKeycloak } from "@/hooks/useKeycloak";
import { descuentoService } from "@/services/descuentoService";
import DescuentoFormModal from "@/components/catalog/DescuentoFormModal";

export default function GestionDescuentos() {
  const { authenticated, isAdmin, keycloak } = useKeycloak();
  const navigate = useNavigate();

  const [descuentos, setDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDescuento, setSelectedDescuento] = useState(null);

  const fetchDescuentos = async () => {
    setLoading(true);
    try {
      const data = await descuentoService.listarTodos();
      setDescuentos(data);
    } catch (error) {
      console.error("Error al cargar todos los descuentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si no está autenticado o no es admin, no cargar nada
    if (authenticated && isAdmin()) {
      fetchDescuentos();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  // Redireccionar si no es admin
  if (!authenticated || !isAdmin()) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-base-100 px-4 py-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-md border border-border">
          <Tag className="w-16 h-16 text-error mx-auto opacity-70" />
          <h2 className="text-2xl font-bold text-accent">Acceso Denegado</h2>
          <p className="text-stone-500 text-sm">
            Lo sentimos, necesitas permisos de administrador para acceder a esta sección de la aplicación.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/" className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto">
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatFecha = (fechaString) => {
    if (!fechaString) return "";
    const parts = fechaString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaString;
  };

  // Determinar si un descuento está actualmente activo basado en la fecha de hoy
  const isCouponActive = (desde, hasta) => {
    const hoyStr = new Date().toISOString().split("T")[0];
    return desde <= hoyStr && hasta >= hoyStr;
  };

  // Cambiar el estado del descuento mediante el toggle
  const handleToggleEstado = async (descuento) => {
    const hoyStr = new Date().toISOString().split("T")[0];
    const activoActualmente = isCouponActive(descuento.fechaDesde, descuento.fechaHasta);

    let nuevaFechaDesde = descuento.fechaDesde;
    let nuevaFechaHasta = descuento.fechaHasta;

    if (activoActualmente) {
      // Desactivar: Seteamos la fechaHasta al día de ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      nuevaFechaHasta = ayer.toISOString().split("T")[0];
    } else {
      // Activar
      nuevaFechaDesde = hoyStr;
      
      // Si el cupón ya venció, le damos una validez de 30 días a partir de hoy
      if (descuento.fechaHasta < hoyStr) {
        const en30Dias = new Date();
        en30Dias.setDate(en30Dias.getDate() + 30);
        nuevaFechaHasta = en30Dias.toISOString().split("T")[0];
      }
    }

    try {
      await descuentoService.editar(descuento.id, {
        codigo: descuento.codigo,
        descripcion: descuento.descripcion,
        monto: descuento.monto,
        fechaDesde: nuevaFechaDesde,
        fechaHasta: nuevaFechaHasta,
      });
      fetchDescuentos();
    } catch (error) {
      console.error("Error al cambiar estado del descuento:", error);
      alert("No se pudo cambiar el estado del descuento. Intenta nuevamente.");
    }
  };

  const handleEditClick = (descuento) => {
    setSelectedDescuento(descuento);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedDescuento(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id, codigo) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el descuento con código "${codigo}"?`)) {
      try {
        await descuentoService.eliminar(id);
        fetchDescuentos();
      } catch (error) {
        console.error("Error al eliminar descuento:", error);
        alert("Ocurrió un error al intentar eliminar el descuento.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("carritoId");
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const handleCopyCode = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const activeCoupons = descuentos.filter((d) => isCouponActive(d.fechaDesde, d.fechaHasta));

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-accent pb-12 font-sans">
      
      {/* Barra de Navegación del Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center border-b border-stone-200 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Encabezado de la página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#471F16] tracking-tight">
              Gestión de Descuentos
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Administra cupones y promociones del catálogo
            </p>
          </div>
          
          <button
            onClick={handleCreateClick}
            className="btn btn-primary flex items-center gap-2 shadow-sm rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Descuento</span>
          </button>
        </div>

        {/* Tabla de Descuentos */}
        <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden mb-12">
          {loading ? (
            <div className="p-12 flex flex-col justify-center items-center gap-3">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <span className="text-stone-500 text-sm">Cargando lista de descuentos...</span>
            </div>
          ) : descuentos.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Tag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="font-medium text-base">No hay cupones creados</p>
              <p className="text-xs text-stone-400 mt-1">Empieza creando uno nuevo con el botón de arriba.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 text-left">Código</th>
                    <th className="py-4 px-6 text-left">Descripción</th>
                    <th className="py-4 px-6 text-center">Descuento</th>
                    <th className="py-4 px-6 text-center">Rango de Fechas</th>
                    <th className="py-4 px-6 text-center">Estado</th>
                    <th className="py-4 px-6 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                  {descuentos.map((descuento) => {
                    const active = isCouponActive(descuento.fechaDesde, descuento.fechaHasta);
                    return (
                      <tr key={descuento.id} className="hover:bg-stone-50/50 transition-colors">
                        
                        {/* Código */}
                        <td className="py-4 px-6 font-medium whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-lg text-[#471F16] font-mono text-xs font-bold uppercase">
                            <Tag className="w-3.5 h-3.5 text-primary" />
                            {descuento.codigo}
                          </span>
                        </td>
                        
                        {/* Descripción */}
                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-semibold text-accent">{descuento.descripcion}</div>
                        </td>
                        
                        {/* Descuento Monto */}
                        <td className="py-4 px-6 text-center font-bold text-base text-[#471F16] whitespace-nowrap">
                          {Math.round(descuento.monto)}% <span className="text-xs font-normal text-stone-500">OFF</span>
                        </td>
                        
                        {/* Rango de Fechas */}
                        <td className="py-4 px-6 text-center whitespace-nowrap text-xs text-stone-600">
                          <div>
                            <span className="font-semibold text-stone-400">Desde</span> {formatFecha(descuento.fechaDesde)}
                          </div>
                          <div className="mt-0.5">
                            <span className="font-semibold text-stone-400">Hasta</span> {formatFecha(descuento.fechaHasta)}
                          </div>
                        </td>
                        
                        {/* Estado y Toggle */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-2">
                            <span
                              className={`badge badge-sm font-semibold py-2 px-2.5 rounded-full ${
                                active
                                  ? "badge-success text-success-content bg-success/20 border-success/30"
                                  : "badge-ghost text-stone-400 bg-stone-100 border-stone-200"
                              }`}
                            >
                              {active ? "Activo" : "Inactivo"}
                            </span>
                            
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => handleToggleEstado(descuento)}
                              className="toggle toggle-sm toggle-primary cursor-pointer"
                              aria-label={`Cambiar estado del cupón ${descuento.codigo}`}
                            />
                          </div>
                        </td>
                        
                        {/* Acciones */}
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleEditClick(descuento)}
                              className="btn btn-ghost btn-square btn-xs sm:btn-sm hover:bg-stone-100 text-stone-600"
                              title="Editar Descuento"
                              aria-label={`Editar descuento ${descuento.codigo}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(descuento.id, descuento.codigo)}
                              className="btn btn-ghost btn-square btn-xs sm:btn-sm hover:bg-error/15 text-error"
                              title="Eliminar Descuento"
                              aria-label={`Eliminar descuento ${descuento.codigo}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sección de Vista Previa de cupones */}
        <div>
          <h2 className="text-xl font-bold text-[#471F16] mb-1">
            Vista previa de cupones activos
          </h2>
          <p className="text-stone-500 text-sm mb-6">
            Así los ven los clientes en el catálogo
          </p>

          {loading ? (
            <div className="h-24 bg-stone-100 rounded-xl flex items-center justify-center text-sm text-stone-400">
              Cargando vista previa...
            </div>
          ) : activeCoupons.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-8 text-center text-stone-400 text-sm">
              No hay cupones activos actualmente para previsualizar.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {activeCoupons.map((coupon) => {
                const isCopied = copiedCode === coupon.codigo;
                return (
                  <div
                    key={`preview-${coupon.id}`}
                    className="bg-white rounded-2xl border-2 border-dashed border-[#C58B82] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[190px] transition-all hover:shadow-sm"
                  >
                    {/* Icono de Ticket */}
                    <div className="absolute top-4 right-4 bg-primary/15 p-2 rounded-full">
                      <Tag className="w-5 h-5 text-primary rotate-90" />
                    </div>

                    {/* Encabezado */}
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-widest text-[#C58B82]">
                        Cupón
                      </span>
                      <h3 className="text-2xl font-black text-[#471F16] mt-0.5 leading-none">
                        {Math.round(coupon.monto)}% OFF
                      </h3>
                      <h4 className="text-sm font-bold text-accent mt-3">
                        {coupon.descripcion}
                      </h4>
                    </div>

                    {/* Sección Copiable inferior */}
                    <div>
                      <div className="border-t border-dashed border-[#C58B82]/50 my-3"></div>
                      <div className="flex items-center gap-2">
                        <div className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg font-mono font-bold text-xs text-accent uppercase tracking-wider flex-grow text-center select-all">
                          {coupon.codigo}
                        </div>
                        <button
                          onClick={() => handleCopyCode(coupon.codigo)}
                          className={`btn btn-sm btn-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                            isCopied
                              ? "btn-success text-success-content hover:bg-success"
                              : "btn-primary hover:bg-[#B37870] border-none"
                          }`}
                          aria-label="Copiar código"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-2.5 text-center">
                        Válido hasta: {formatFecha(coupon.fechaHasta)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Form Modal */}
      <DescuentoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchDescuentos}
        descuento={selectedDescuento}
      />
      
    </div>
  );
}
