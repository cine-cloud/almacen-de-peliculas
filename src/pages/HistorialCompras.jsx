import { useEffect, useState } from "react";
import { useKeycloak } from "../hooks/useKeycloak";
import { Link } from "react-router-dom";
import { ArrowLeft, Tag, Star, MessageSquare, CheckCircle, AlertCircle, X } from "lucide-react";
import ratingService from "../services/ratingService";

function HistorialCompras() {
  const [compras, setCompras] = useState([]);
  const { keycloak, authenticated, isAdmin } = useKeycloak();
  const [loading, setLoading] = useState(false);
  const [openDetails, setOpenDetails] = useState({});

  // Estado para ratings del usuario por película: { [peliculaId]: RatingDTO }
  const [userRatings, setUserRatings] = useState({});

  // Estado para el modal de reseña
  const [selectedItemForRating, setSelectedItemForRating] = useState(null);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  const toggleDetails = (compraId) => {
    setOpenDetails((prev) => ({
      ...prev,
      [compraId]: !prev[compraId],
    }));
  };

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const usuarioId = keycloak.tokenParsed?.preferred_username || keycloak.subject;
    const url = isAdmin()
      ? "http://localhost:8080/historial/todos"
      : `http://localhost:8080/historial/${usuarioId}`;

    fetch(url)
      .then((response) => response.json())
      .then(async (data) => {
        setCompras(data);

        // Cargar ratings del usuario para las películas adquiridas
        if (usuarioId && Array.isArray(data)) {
          const peliculaIds = new Set();
          data.forEach((compra) => {
            compra.items?.forEach((item) => {
              if (item.peliculaId) {
                peliculaIds.add(item.peliculaId);
              }
            });
          });

          const ratingsMap = {};
          await Promise.all(
            Array.from(peliculaIds).map(async (peliculaId) => {
              const voto = await ratingService.obtenerVotoUsuario(peliculaId, usuarioId);
              if (voto) {
                ratingsMap[peliculaId] = voto;
              }
            })
          );
          setUserRatings(ratingsMap);
        }
      })
      .catch((error) => {
        console.error("Error obteniendo historial:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authenticated, keycloak]);

  const handleOpenRatingModal = (item) => {
    setSelectedItemForRating(item);
    setEstrellas(5);
    setComentario("");
  };

  const handleCloseRatingModal = () => {
    setSelectedItemForRating(null);
    setEstrellas(5);
    setComentario("");
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!selectedItemForRating) return;

    const usuarioId = keycloak.tokenParsed?.preferred_username || keycloak.subject;
    if (!usuarioId) {
      showToast("Debe estar autenticado para calificar", "error");
      return;
    }

    setSubmittingRating(true);

    try {
      const nuevoRating = await ratingService.votar({
        usuarioId: usuarioId,
        peliculaId: selectedItemForRating.peliculaId,
        estrellas: Number(estrellas),
        comentario: comentario.trim(),
      });

      setUserRatings((prev) => ({
        ...prev,
        [selectedItemForRating.peliculaId]: nuevoRating,
      }));

      showToast("¡Reseña publicada con éxito!", "success");
      handleCloseRatingModal();
    } catch (error) {
      console.error("Error al publicar reseña:", error);
      const errorMsg =
        error.response?.data?.message || "No se pudo guardar la reseña. Intenta nuevamente.";
      showToast(errorMsg, "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderStarRatingInput = () => {
    return (
      <div className="flex items-center gap-1.5 my-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setEstrellas(star)}
            className="focus:outline-none transform hover:scale-110 transition-transform p-1"
          >
            <Star
              className={`w-8 h-8 ${star <= estrellas
                  ? "text-amber-400 fill-amber-400"
                  : "text-stone-300 fill-stone-100"
                }`}
            />
          </button>
        ))}
        <span className="ml-2 font-bold text-lg text-amber-600">
          {estrellas} / 5
        </span>
      </div>
    );
  };

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
      {/* Toast Notification */}
      {notification && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${notification.type === "success"
                ? "alert-success text-white"
                : "alert-error text-white"
              } shadow-xl flex items-center gap-2`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

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
            {isAdmin()
              ? "No hay compras registradas en el sistema"
              : "Aún no realizaste compras"}
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
          const tieneDescuento =
            compra.descuentoMonto && Number(compra.descuentoMonto) > 0;
          const tieneMasDeDosPeliculas = compra.items && compra.items.length > 2;

          return (
            <div
              key={compra.id}
              className="card bg-base-200 shadow-md mb-4 p-4 border border-base-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-bold text-lg text-accent">
                    Fecha: {new Date(compra.fechaTransaccion).toLocaleString()}
                  </h4>
                  {isAdmin() && (
                    <p className="text-sm text-gray-600 mt-1 font-semibold">
                      Cliente:{" "}
                      <span className="badge badge-primary">
                        {compra.nombreCliente || compra.usuarioId || compra.emailCliente || "Cliente Anónimo"}
                      </span>
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-md font-semibold text-[#471F16]">
                    <span>
                      Total pagado:{" "}
                      <span className="text-primary font-bold">
                        ${Number(compra.total).toFixed(2)}
                      </span>
                    </span>
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
                  {isDetailsOpen
                    ? "Ocultar Detalles"
                    : "Ver Detalles de compra"}
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
                        <span>
                          -${Number(compra.descuentoMonto).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-stone-400 text-xs italic">
                        <span>Descuento:</span>
                        <span>Sin descuento aplicado</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-[#471F16] pt-1.5 border-t border-base-200">
                      <span>Total final:</span>
                      <span className="text-primary">
                        ${Number(compra.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Lista de películas con opción de rating */}
                  <div>
                    <h5 className="font-semibold mb-3 text-[#471F16]">
                      Películas Adquiridas ({compra.items?.length || 0}):
                    </h5>
                    <ul
                      className={`grid grid-cols-1 gap-3 ${tieneMasDeDosPeliculas
                          ? "max-h-[360px] overflow-y-auto pr-2 border border-base-300/70 rounded-xl p-2 bg-base-100/50"
                          : ""
                        }`}
                    >
                      {compra.items?.map((item, i) => {
                        const userRating = userRatings[item.peliculaId];

                        return (
                          <li
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-4 rounded-xl border border-base-300 shadow-xs hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={
                                  item.imagenUrl ||
                                  "https://placehold.co/200x300?text=Sin+Imagen"
                                }
                                alt={item.tituloSnapshot}
                                className="w-16 h-24 object-cover rounded shadow border"
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/200x300?text=Sin+Imagen";
                                }}
                              />
                              <div>
                                <p className="font-bold text-accent text-md">
                                  {item.tituloSnapshot}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Precio unitario: ${item.precioUnitario}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Cantidad: {item.cantidad}
                                </p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                  Subtotal: $
                                  {(item.precioUnitario * item.cantidad).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Sección de Reseña / Rating */}
                            <div className="flex flex-col items-start sm:items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-base-200">
                              {userRating ? (
                                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 max-w-xs text-left sm:text-right">
                                  <div className="flex items-center gap-1 sm:justify-end mb-1">
                                    <span className="badge badge-success text-xs font-semibold gap-1 text-white">
                                      <CheckCircle className="w-3 h-3" /> Reseñada
                                    </span>
                                    <div className="flex items-center text-amber-500 font-bold text-sm ml-2">
                                      <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                                      {userRating.estrellas} / 5
                                    </div>
                                  </div>
                                  {userRating.comentario && (
                                    <p className="text-xs text-stone-700 italic flex items-start gap-1">
                                      <MessageSquare className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                                      <span>"{userRating.comentario}"</span>
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRatingModal(item)}
                                  className="btn btn-sm btn-outline btn-primary rounded-full flex items-center gap-1.5 hover:shadow-md transition-all"
                                >
                                  <Star className="w-4 h-4" />
                                  <span>Agregar reseña</span>
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal para Agregar Reseña */}
      {selectedItemForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-base-100 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-base-300 relative">
            <button
              onClick={handleCloseRatingModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#471F16] mb-1 flex items-center gap-2">
              Agregar Reseña
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Califica tu experiencia con la película{" "}
              <span className="font-semibold text-accent">
                "{selectedItemForRating.tituloSnapshot}"
              </span>
            </p>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Calificación (1 a 5 estrellas)
                </label>
                {renderStarRatingInput()}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Comentario
                </label>
                <textarea
                  rows={4}
                  className="textarea textarea-bordered w-full rounded-xl focus:textarea-primary text-sm"
                  placeholder="Escribe tu opinión o reseña sobre esta película..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  maxLength={500}
                ></textarea>
                <span className="text-xs text-stone-400 flex justify-end mt-1">
                  {comentario.length} / 500 caracteres
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRatingModal}
                  className="btn btn-ghost rounded-full"
                  disabled={submittingRating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-full px-6 flex items-center gap-2"
                  disabled={submittingRating}
                >
                  {submittingRating && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  <span>Enviar Reseña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialCompras;