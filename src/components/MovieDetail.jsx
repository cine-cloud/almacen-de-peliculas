import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { peliculas } from '../data/Pelicula';
import { FaStar } from 'react-icons/fa'; // Instala react-icons para los íconos de estrella

const MovieDetail = () => {
    const { id } = useParams();
    const pelicula = peliculas.find(p => p.id === parseInt(id));

    if (!pelicula) {
        return <div className="p-4 text-center text-accent">Película no encontrada.</div>;
    }

    // Helper para generar estrellas de rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FaStar key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-yellow-300"} />
            );
        }
        return stars;
    };

    return (
        <div className="container mx-auto p-4">
            <Link to="/" className="btn btn-ghost mb-4 text-primary">&larr; Volver al catálogo</Link>
            <div className="bg-neutral p-6 rounded-2xl shadow-xl lg:flex lg:gap-8">
                <div className="lg:w-1/3">
                    <img src={pelicula.imagen_ampliada} alt={pelicula.titulo} className="w-full rounded-2xl shadow-lg mb-4" />
                    <div className="flex flex-col gap-2 mt-4">
                        <button className="btn btn-primary rounded-full">Ver ahora</button>
                        <button className="btn btn-outline btn-secondary rounded-full">
                            Añadir al carrito
                        </button>

                        {/* Botones de acción */}
                        <div className="flex gap-2">
                            {/* Favorito */}
                            <button
                                className="btn flex-1 btn-outline btn-secondary rounded-full hover:bg-primary hover:text-primary-content">
                                ♥
                            </button>
                            {/* Compartir */}
                            <button
                                className="btn flex-1 btn-outline btn-secondary rounded-full hover:bg-accent hover:text-accent-content">
                                ⤴
                            </button>
                        </div>
                    </div>
                </div>
                <div className="lg:w-2/3 mt-6 lg:mt-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="badge badge-outline badge-secondary font-semibold">{pelicula.genero.join(', ')}</div>
                        <div className="badge badge-accent text-neutral font-semibold">{pelicula.condicion}</div>
                    </div>
                    <h1 className="text-4xl font-bold text-accent mb-2">{pelicula.titulo}</h1>
                    <p className="text-gray-500 mb-4">Fecha de salida: {pelicula.fecha_salida} | Formato: {pelicula.formato}</p>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-primary">${pelicula.precio}</span>
                        <div className="rating rating-sm">
                            {renderStars(pelicula.rating)}
                        </div>
                        <span className="text-sm text-gray-500">({pelicula.rating} de 5 estrellas)</span>
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h2 className="text-xl font-semibold text-accent mb-2">Sinopsis</h2>
                    <p className="text-gray-700 mb-4">{pelicula.sinopsis}</p>

                    <h3 className="text-lg font-semibold text-accent mb-1">Reparto y Equipo</h3>
                    <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Directores:</span> {pelicula.directores.join(', ')}
                    </div>
                    <div className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Reparto Principal:</span> {pelicula.actores.join(', ')}
                    </div>

                    <hr className="my-4 border-t border-gray-300" />

                    <h3 className="text-xl font-semibold text-accent mb-2">Reseñas de Clientes</h3>
                    {pelicula.reviews.map((review, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded-lg mb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold">{review.autor}</span>
                                <span className="text-gray-500 text-xs">21 de agosto de 2024</span>
                            </div>
                            <p className="text-gray-700">{review.comentario}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
