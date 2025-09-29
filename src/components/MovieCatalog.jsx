import { Link } from 'react-router-dom';
import { peliculas } from '../data/Pelicula';
import SearchBar from "./SearchBar.jsx";

const MovieCatalog = () => {
    const novedades = peliculas.sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida));
    const peliculasOrdenadas = novedades; // Misma lista para el carrusel y el listado

    return (
        <div className="container mx-auto p-4">
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Cine Cloud
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Descubre las últimas novedades en películas
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <SearchBar />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-secondary mb-4">Últimas Novedades</h1>

            <div className="carousel w-full rounded-box mb-8">
                {Array.from({length: Math.ceil(novedades.length / 3)}).map((_, slideIndex) => {
                    const start = slideIndex * 3;
                    const group = novedades.slice(start, start + 3);

                    return (
                        <div
                            key={slideIndex}
                            id={`slide${slideIndex + 1}`}
                            className="carousel-item relative w-full"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                {group.map((pelicula) => (
                                    <Link
                                        key={pelicula.id}
                                        to={`/pelicula/${pelicula.id}`}
                                        className="block"
                                    >
                                        <img
                                            src={pelicula.imagen_ampliada}
                                            className="w-full h-96 object-cover rounded-box"
                                            alt={pelicula.titulo}
                                        />
                                    </Link>
                                ))}
                            </div>

                            {/* Botones de navegación */}
                            <div
                                className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                                <a
                                    href={`#slide${slideIndex === 0 ? Math.ceil(novedades.length / 3) : slideIndex}`}
                                    className="btn btn-circle"
                                >
                                    ❮
                                </a>
                                <a
                                    href={`#slide${slideIndex === Math.ceil(novedades.length / 3) - 1 ? 1 : slideIndex + 2}`}
                                    className="btn btn-circle"
                                >
                                    ❯
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            <h2 className="text-2xl font-bold text-secondary mb-4 mt-8">Catálogo Completo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {peliculasOrdenadas.map(pelicula => (
                    <Link to={`/pelicula/${pelicula.id}`} key={pelicula.id}
                          className="card bg-neutral shadow-xl rounded-2xl transition-transform duration-300 transform hover:scale-105">
                        <figure className="relative h-64 overflow-hidden rounded-t-2xl">
                            <img src={pelicula.imagen_pequena} alt={pelicula.titulo}
                                 className="w-full h-full object-cover"/>
                            <div className="badge badge-primary absolute top-2 right-2 text-xs font-semibold">Novedad
                            </div>
                        </figure>
                        <div className="card-body p-4">
                            <h3 className="card-title text-accent text-lg">{pelicula.titulo}</h3>
                            <p className="text-sm text-gray-600">Fecha de salida: {pelicula.fecha_salida}</p>
                            <p className="text-lg font-bold text-primary">${pelicula.precio}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                <span className="font-semibold">Directores:</span> {pelicula.directores.join(', ')}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                <span
                                    className="font-semibold">Actores:</span> {pelicula.actores.slice(0, 3).join(', ')}...
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <button className="btn btn-primary rounded-full btn-sm">Ver ahora</button>
                                <button className="btn btn-outline btn-secondary rounded-full btn-sm">Más info</button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MovieCatalog;
