import { Link } from 'react-router-dom';
import { peliculas } from '../data/Pelicula';

const CatalogoPelicula = () => {
    const novedades = peliculas.sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida));
    const peliculasOrdenadas = novedades; // Misma lista para el carrusel y el listado

    return (
        <div className="container mx-auto p-4">
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            CineCatalog
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Descubre las últimas novedades en películas
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <div
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4"/>
                            <input
                                placeholder="Buscar películas..."
                                className="pl-10"
                            />
                        </div>
                        <button variant="outline" className="flex items-center gap-2">
                            <filter className="w-4 h-4"/>
                            Filtros
                        </button>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-accent mb-4">Últimas Novedades</h1>

            <div className="carousel w-full rounded-box mb-8">
                {novedades.slice(0, 4).map((pelicula, index) => (
                    <div key={pelicula.id} id={`slide${index + 1}`} className="carousel-item relative w-full">
                        <Link to={`/pelicula/${pelicula.id}`} className="block w-full">
                            <img
                                src={pelicula.imagen_ampliada}
                                className="w-full h-96 object-cover rounded-box"
                                alt={pelicula.titulo}
                            />
                        </Link>
                        <div
                            className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                            <a href={`#slide${index === 0 ? novedades.length : index}`} className="btn btn-circle">❮</a>
                            <a href={`#slide${index === novedades.length - 1 ? 1 : index + 2}`}
                               className="btn btn-circle">❯</a>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-2xl font-bold text-accent mb-4 mt-8">Catálogo Completo</h2>
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

export default CatalogoPelicula;
