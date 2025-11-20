import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faShareNodes, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { peliculaService } from '@/services/peliculaService';
import { useCart } from '@/hooks/useCart.jsx';
import ImageWithFallback from '@/components/shared/ImageWithFallback.jsx';

const MovieDetail = () => {
    const { id } = useParams();
    const [pelicula, setPelicula] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        const cargarPelicula = async () => {
            try {
                setLoading(true);
                const data = await peliculaService.obtenerDetalle(id);
                setPelicula(data);
            } catch (err) {
                console.error('Error al cargar película:', err);
                setError('Error al cargar la película');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarPelicula();
        }
    }, [id]);

    const handleAddToCart = () => {
        addToCart(pelicula);
        setShowSuccess(true);

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    // Helper para generar estrellas de rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <input
                    key={i}
                    type="radio"
                    name="rating"
                    className="mask mask-star-2 bg-orange-400"
                    aria-label={`${i + 1} star`}
                    checked={i < rating}
                    readOnly
                />
            );
        }
        return <div className="rating rating-lg">{stars}</div>;
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
                <Link to="/" className="btn btn-ghost mb-4 text-primary">&larr; Volver al catálogo</Link>
                <div className="alert alert-error">
                    {error || 'Película no encontrada.'}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Notificación de éxito */}
            {showSuccess && (
                <div className="toast toast-top toast-end z-50">
                    <div className="alert alert-success alert-soft flex">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                        <span className="font-semibold">¡Se ha añadido al carrito!</span>
                    </div>
                </div>
            )}

            <Link to="/" className="btn btn-ghost mb-4 text-primary">&larr; Volver al catálogo</Link>

            <div className="bg-neutral p-6 rounded-2xl shadow-xl lg:flex lg:gap-8">
                <div className="lg:w-1/3">
                    <ImageWithFallback
                        src={pelicula.imagenAmpliada}
                        alt={pelicula.titulo}
                        className="w-full rounded-2xl shadow-lg mb-4"
                    />
                    <div className="flex flex-col gap-2 mt-4">
                        <button className="btn btn-primary rounded-full">Ver ahora</button>
                        <button
                            className="btn btn-outline btn-secondary rounded-full"
                            onClick={handleAddToCart}
                        >
                            Añadir al carrito
                        </button>

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
                    <div className="flex items-center gap-2 mb-2">
                        <div className="badge badge-outline badge-secondary font-semibold">
                            {pelicula.generos?.join(', ') || 'Sin género'}
                        </div>
                        <div className="badge badge-accent text-neutral font-semibold">
                            {pelicula.condicion}
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-accent mb-2">{pelicula.titulo}</h1>
                    <p className="text-gray-500 mb-4">
                        Fecha de salida: {pelicula.fechaSalida} | Formato: {pelicula.formato}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">${pelicula.precio}</span>
                        <div>
                            {renderStars(4)} {/* Rating hardcodeado por ahora */}
                        </div>
                        <span className="text-sm text-gray-500">(4 de 5 estrellas)</span>
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h2 className="text-xl font-semibold text-accent mb-2">Sinopsis</h2>
                    <p className="text-gray-700 mb-4">{pelicula.sinopsis}</p>

                    <h3 className="text-lg font-semibold text-accent mb-1">Reparto y Equipo</h3>
                    <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Directores:</span> {pelicula.directores?.join(', ') || 'No disponible'}
                    </div>
                    <div className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Reparto Principal:</span> {pelicula.actores?.join(', ') || 'No disponible'}
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h3 className="text-xl font-semibold text-accent mb-2">Reseñas de Clientes</h3>
                    {/* Reviews hardcodeadas por ahora */}
                    <div className="p-4 bg-gray-100 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">Usuario</span>
                            <span className="text-gray-500 text-xs">21 de agosto de 2024</span>
                        </div>
                        <p className="text-gray-700">Excelente película, muy recomendable.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
