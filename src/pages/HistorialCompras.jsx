import { useContext, useEffect, useState } from "react";
import { KeycloakContext } from "../hooks/KeycloakProvider";
import { Link } from "react-router-dom";

function HistorialCompras() {
  const [compras, setCompras] = useState([]);

  const { keycloak, authenticated } = useContext(KeycloakContext);

  useEffect(() => {
    if (!authenticated) return;

    const usuarioId = keycloak.tokenParsed?.preferred_username;

    console.log("Usuario autenticado:", usuarioId);

    fetch(`http://localhost:8083/historial/${usuarioId}`)
      .then((response) => {
        console.log("status:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("datos recibidos:", data);
        setCompras(data);
      })
      .catch((error) => console.error("Error obteniendo historial:", error));
  }, [authenticated, keycloak]);

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
        compras.map((compra, index) => (
          <div key={index} className="card bg-base-200 shadow-xl mb-4 p-4">
            <h4 className="font-bold">
              Fecha: {new Date(compra.fechaTransaccion).toLocaleString()}
            </h4>

            <p className="mt-2 text-lg font-semibold">
              Total pagado: ${compra.total}
            </p>

            <hr className="my-3" />

            <div className="mt-4">
              <h5 className="font-semibold">Películas:</h5>

              <ul className="list-disc pl-6">
                {compra.items?.map((item, i) => (
                  <li key={i}>
                    🎬 {item.tituloSnapshot}
                    {" - $"}
                    {item.precioUnitario}
                    {" | Cantidad: "}
                    {item.cantidad}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistorialCompras;
