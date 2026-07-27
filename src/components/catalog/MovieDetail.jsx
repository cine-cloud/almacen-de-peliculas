import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faShareNodes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { peliculaService } from '@/services/peliculaService';
import ratingService from '@/services/ratingService';
import { useCart } from '@/hooks/useCart.jsx';
import imagenNoDisponible from "../../assets/Imagen_No_Disponible.jpg";
import { useKeycloak } from "@/hooks/useKeycloak.js";

const MovieDetail = () => {
    const { id } = useParams();
    const [pelicula, setPelicula] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [promedioRating, setPromedioRating] = useState({ promedio: 0, totalVotos: 0 });
    const [resenas, setResenas] = useState([]);
    const { addToCart } = useCart();
    const { isAdmin } = useKeycloak();

    useEffect(() => {
        const cargarPeliculaYRatings = async () => {
            try {
                setLoading(true);
                const data = await peliculaService.obtenerDetalle(id);
                setPelicula(data);

                // Cargar promedio y reseñas reales de rating-backend
                const [promData, listData] = await Promise.all([
                    ratingService.obtenerPromedioPorPelicula(id),
                    ratingService.obtenerPorPelicula(id),
                ]);

                if (promData) setPromedioRating(promData);
                if (listData) setResenas(listData);
            } catch (err) {
                console.error('Error al cargar película o ratings:', err);
                setError('Error al cargar la película');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarPeliculaYRatings();
        }
    }, [id]);

    const handleAddToCart = async () => {
        const res = await addToCart(pelicula);
        if (res) {
            setNotification(res);
            setTimeout(() => {
                setNotification(null);
            }, 3500);
        }
    };

    const renderStarsDisplay = (ratingValue) => {
        const rounded = Math.round(ratingValue);
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 ${
                            star <= rounded
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-stone-300 fill-stone-100'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-64">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !pelicula) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex items-center border-b border-stone-200 pb-4 mb-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver al Catálogo</span>
                    </Link>
                </div>
                <div className="alert alert-error">
                    {error || 'Película no encontrada.'}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Notificación de éxito o error de stock */}
            {notification && (
                <div className="toast toast-top toast-end z-50">
                    <div className={`alert ${notification.success ? 'alert-success' : 'alert-error text-white'} alert-soft flex shadow-xl border border-border`}>
                        <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
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

            <div className="bg-neutral p-6 rounded-2xl shadow-xl lg:flex lg:gap-8">
                <div className="lg:w-1/3">
                    <img
                      src={pelicula.imagenAmpliada || imagenNoDisponible}
                      alt={pelicula.titulo}
                      onError={(e) => {
                         e.target.src = imagenNoDisponible;
                      }}
                      className="rounded-xl shadow-lg border w-full object-cover"
                    />
                    <div className="flex flex-col gap-2 mt-4">
                        {!isAdmin() && <button className="btn btn-primary rounded-full">Ver ahora</button>}
                        {!isAdmin() && (
                            pelicula.stock != null && pelicula.stock > 0 ? (
                                <button
                                    className="btn btn-outline btn-secondary rounded-full"
                                    onClick={handleAddToCart}
                                >
                                    Añadir al carrito
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="btn btn-disabled rounded-full cursor-not-allowed opacity-60"
                                >
                                    Sin stock
                                </button>
                            )
                        )}

                        <div className="flex gap-2">
                            <button className="btn flex-1 btn-outline btn-secondary rounded-full hover:text-primary-content">
                                <FontAwesomeIcon icon={faHeart} />
                            </button>
                            <button className="btn flex-1 btn-outline btn-accent rounded-full hover:bg-accent hover:text-accent-content">
                                <FontAwesomeIcon icon={faShareNodes} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:w-2/3 mt-6 lg:mt-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="badge badge-outline badge-secondary font-semibold">
                            {pelicula.generos?.join(', ') || 'Sin género'}
                        </div>
                        <div className="badge badge-accent text-neutral font-semibold">
                            {pelicula.condicion}
                        </div>
                        {pelicula.stock != null && pelicula.stock > 0 ? (
                            <div className="badge badge-success font-semibold">
                                Stock disponible: {pelicula.stock} unidades
                            </div>
                        ) : (
                            <div className="badge badge-error text-white font-semibold">
                                Sin stock
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-accent mb-2">{pelicula.titulo}</h1>
                    <p className="text-gray-500 mb-4">
                        Fecha de salida: {pelicula.fechaSalida} | Formato: {pelicula.formato}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl font-bold text-primary">${pelicula.precio}</span>
                        <div className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                            {renderStarsDisplay(promedioRating.promedio)}
                            <span className="text-sm font-semibold text-stone-700">
                                {promedioRating.promedio > 0 ? promedioRating.promedio.toFixed(1) : "Sin calificar"}
                            </span>
                            <span className="text-xs text-stone-500">
                                ({promedioRating.totalVotos} {promedioRating.totalVotos === 1 ? 'voto' : 'votos'})
                            </span>
                        </div>
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h2 className="text-xl font-semibold text-accent mb-2">Sinopsis</h2>
                    <p className="text-gray-700 mb-4">{pelicula.sinopsis}</p>

                    <h3 className="text-lg font-semibold text-accent mb-1">Reparto y Equipo</h3>
                    <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Directores:</span> {Array.isArray(pelicula.directores) ? pelicula.directores.join(', ') : (pelicula.director || 'No disponible')}
                    </div>
                    <div className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Reparto Principal:</span> {Array.isArray(pelicula.actores) ? pelicula.actores.join(', ') : (pelicula.actores || 'No disponible')}
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h3 className="text-xl font-semibold text-accent mb-3 flex items-center gap-2">
                        Reseñas de Clientes ({resenas.length})
                    </h3>
                    
                    {resenas.length === 0 ? (
                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-stone-500 italic text-sm">
                            Aún no hay reseñas registradas para esta película.
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {resenas.map((resena) => (
                                <div key={resena.id || resena.fecha} className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-accent text-sm">{resena.usuarioId}</span>
                                            {renderStarsDisplay(resena.estrellas)}
                                        </div>
                                        {resena.fecha && (
                                            <span className="text-stone-400 text-xs">
                                                {new Date(resena.fecha).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1">
                                        {resena.comentario || <span className="italic text-stone-400">Sin comentario escrito.</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
