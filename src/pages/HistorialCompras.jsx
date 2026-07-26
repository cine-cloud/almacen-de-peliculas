import { useEffect, useState } from "react";
import { useKeycloak } from "../hooks/useKeycloak";
import { Link } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";

function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const { keycloak, authenticated, isAdmin } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [openDetails, setOpenDetails] = useState({});

  const toggleDetails = (compraId) => {
    setOpenDetails((prev) => ({
      ...prev,
      [compraId]: !prev[compraId],
    }));
  };

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const usuarioId = keycloak.tokenParsed?.preferred_username;
    const url = isAdmin()
      ? "http://localhost:8083/historial/todos"
      : `http://localhost:8083/historial/${usuarioId}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCompras(data);
      })
      .catch((error) => {
        console.error("Error obteniendo historial:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authenticated, keycloak]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-6">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <h2 className="text-2xl font-semibold">
          Cargando historial de compras...
        </h2>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 gap-6">
        <h2 className="text-3xl font-bold">Debes iniciar sesión</h2>
        <p className="text-gray-500">
          Inicia sesión para visualizar el historial de compras.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center border-b border-stone-200 pb-4 mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-[#471F16]">
        {isAdmin() ? "Registro de Compras" : "Historial de Compras"}
      </h2>

      {compras.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-6">
          <h2 className="text-3xl font-bold">
            {isAdmin() ? "No hay compras registradas en el sistema" : "Aún no realizaste compras"}
          </h2>
          <p className="text-lg text-gray-500">
            {isAdmin()
              ? "Las compras realizadas por los clientes aparecerán aquí."
              : "Explora nuestro catálogo y encuentra tu próxima película favorita."}
          </p>
          {!isAdmin() && (
            <div className="flex gap-4">
              <Link to="/" className="btn btn-primary">
                Ir al Catálogo
              </Link>
              <Link to="/carrito" className="btn btn-secondary">
                Ver Carrito
              </Link>
            </div>
          )}
        </div>
      ) : (
        compras.map((compra) => {
          const isDetailsOpen = openDetails[compra.id];
          const tieneDescuento = compra.descuentoMonto && Number(compra.descuentoMonto) > 0;
          const tieneMasDeDosPeliculas = compra.items && compra.items.length > 2;

          return (
            <div key={compra.id} className="card bg-base-200 shadow-md mb-4 p-4 border border-base-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-lg text-accent">
                    Fecha: {new Date(compra.fechaTransaccion).toLocaleString()}
                  </h4>
                  {isAdmin() && (
                    <p className="text-sm text-gray-600 mt-1 font-semibold">
                      Cliente: <span className="badge badge-primary">{compra.usuarioId}</span>
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-md font-semibold text-[#471F16]">
                    <span>Total pagado: <span className="text-primary font-bold">${Number(compra.total).toFixed(2)}</span></span>
                    {tieneDescuento && (
                      <span className="badge badge-success text-xs font-bold gap-1">
                        <Tag className="w-3 h-3" />
                        Descuento: -${Number(compra.descuentoMonto).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleDetails(compra.id)}
                  className="btn btn-primary btn-sm rounded-full"
                >
                  {isDetailsOpen ? "Ocultar Detalles" : "Ver Detalles de compra"}
                </button>
              </div>

              {isDetailsOpen && (
                <div className="mt-4 pt-4 border-t border-base-300 space-y-4">
                  {/* Detalle del Descuento aplicado */}
                  <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 text-sm space-y-1.5">
                    {compra.subtotal && (
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal:</span>
                        <span>${Number(compra.subtotal).toFixed(2)}</span>
                      </div>
                    )}
                    {tieneDescuento ? (
                      <div className="flex justify-between text-success font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4" />
                          Descuento Aplicado:
                        </span>
                        <span>-${Number(compra.descuentoMonto).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-stone-400 text-xs italic">
                        <span>Descuento:</span>
                        <span>Sin descuento aplicado</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-[#471F16] pt-1.5 border-t border-base-200">
                      <span>Total final:</span>
                      <span className="text-primary">${Number(compra.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Lista de películas con scroll si son más de 2 */}
                  <div>
                    <h5 className="font-semibold mb-3 text-[#471F16]">
                      Películas Adquiridas ({compra.items?.length || 0}):
                    </h5>
                    <ul
                      className={`grid grid-cols-1 gap-3 ${
                        tieneMasDeDosPeliculas
                          ? "max-h-[260px] overflow-y-auto pr-2 border border-base-300/70 rounded-xl p-2 bg-base-100/50"
                          : ""
                      }`}
                    >
                      {compra.items?.map((item, i) => (
                        <li key={i} className="flex items-center gap-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-xs">
                          <img
                            src={item.imagenUrl || "https://placehold.co/200x300?text=Sin+Imagen"}
                            alt={item.tituloSnapshot}
                            className="w-16 h-24 object-cover rounded shadow border"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/200x300?text=Sin+Imagen";
                            }}
                          />
                          <div>
                            <p className="font-bold text-accent text-md">{item.tituloSnapshot}</p>
                            <p className="text-sm text-gray-600">Precio unitario: ${item.precioUnitario}</p>
                            <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              Subtotal: ${(item.precioUnitario * item.cantidad).toFixed(2)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default HistorialCompras;