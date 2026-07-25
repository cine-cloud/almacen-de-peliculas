import { useEffect, useState } from "react";
import { useKeycloak } from "../hooks/useKeycloak";
import { Link } from "react-router-dom";

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
        <Link to="/" className="btn btn-ghost text-primary">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link to="/" className="btn btn-ghost text-primary">
          ← Volver al catálogo
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
                  <p className="mt-1 text-md font-semibold text-[#471F16]">
                    Total pagado: <span className="text-primary font-bold">${compra.total}</span>
                  </p>
                </div>

                <button
                  onClick={() => toggleDetails(compra.id)}
                  className="btn btn-primary btn-sm rounded-full"
                >
                  {isDetailsOpen ? "Ocultar Detalles" : "Ver Detalles de compra"}
                </button>
              </div>

              {isDetailsOpen && (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <h5 className="font-semibold mb-4 text-[#471F16]">Películas Adquiridas:</h5>
                  <ul className="grid grid-cols-1 gap-4">
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
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default HistorialCompras;