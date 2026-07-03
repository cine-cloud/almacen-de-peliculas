import { useContext, useEffect, useState } from "react";
import { KeycloakContext } from "../hooks/KeycloakProvider";
import { Link } from "react-router-dom";

function HistorialCompras() {
  const [compras, setCompras] = useState([]);

  const { keycloak, authenticated } = useContext(KeycloakContext);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (!authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const usuarioId = keycloak.tokenParsed?.preferred_username;

    fetch(`http://localhost:8083/historial/${usuarioId}`)
      .then(response => response.json())
      .then(data => {
        setCompras(data);
      })
      .catch(error => {
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
          Inicia sesión para visualizar tu historial de compras.
        </p>

        <Link to="/" className="btn btn-primary">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">

      <div className="mb-4">
        <Link to="/" className="btn btn-outline btn-sm">
          ← Volver al catálogo
        </Link>
      </div>

      <h2 className="text-3xl font-bold mb-6">Historial de Compras</h2>

      {compras.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 gap-6">
          <h2 className="text-3xl font-bold">Aún no realizaste compras</h2>

          <p className="text-lg text-gray-500">
            Explora nuestro catálogo y encuentra tu próxima película favorita.
          </p>

          <div className="flex gap-4">
            <Link to="/" className="btn btn-primary">
              Ir al Catálogo
            </Link>

            <Link to="/carrito" className="btn btn-secondary">
              Ver Carrito
            </Link>
          </div>
        </div>
      ) : (
        compras.map((compra) => (
          <div key={compra.id} className="card bg-base-200 shadow-xl mb-4 p-4">
            <h4 className="font-bold">
              Fecha: {new Date(compra.fechaTransaccion).toLocaleString()}
            </h4>

            <p className="mt-2 text-lg font-semibold">
              Total pagado: ${compra.total}
            </p>

            <hr className="my-3" />

            <div className="mt-4">
              <h5 className="font-semibold mb-4">Películas:</h5>

              <ul>
                {compra.items?.map((item, i) => {
                  console.log("Imagen recibida:", item.imagenUrl);
                  console.log(compra.fechaTransaccion);
                  return (
                    <li key={i} className="flex items-center gap-4 mb-4">
                      <img
                        src={item.imagenUrl}
                        alt={item.tituloSnapshot}
                        className="w-20 h-28 object-cover rounded shadow border"
                        onError={(e) => {
                          console.log("Error cargando imagen:", item.imagenUrl);

                          // Imagen temporal para depuración
                          e.target.src =
                            "https://placehold.co/200x300?text=Sin+Imagen";
                        }}
                      />

                      <div>
                        <p className="font-semibold">{item.tituloSnapshot}</p>

                        <p>Precio: ${item.precioUnitario}</p>

                        <p>Cantidad: {item.cantidad}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistorialCompras;