import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import SearchBar from "../shared/SearchBar.jsx";
import {catalogoService} from '@/services/catalogoService';
import { useKeycloak} from "@/hooks/useKeycloak.js";

const MovieCatalog = () => {
    const [catalogos, setCatalogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { keycloak, initialized, authenticated } = useKeycloak();

    useEffect(() => {
        // Esperar a que Keycloak esté inicializado antes de cargar datos
        if (!initialized || !authenticated) {
            return;
        }

        const cargarCatalogos = async () => {
            try {
                setLoading(true);
                const data = await catalogoService.listar();
                setCatalogos(data);
            } catch (err) {
                console.error('Error al cargar catálogos:', err);

                // Si es error 401/403, el interceptor ya maneja el login
                if (err.response?.status !== 401 && err.response?.status !== 403) {
                    setError('Error al cargar el catálogo');
                }
            } finally {
                setLoading(false);
            }
        };

        cargarCatalogos();
    }, [initialized, authenticated]);

    // Mostrar loading mientras Keycloak se inicializa
    if (!initialized || !authenticated) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-64">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <span className="ml-2">Inicializando...</span>
                </div>
            </div>
        );
    }

    // Si hay error de autenticación, mostrar mensaje apropiado
    if (error && !authenticated) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-warning text-center">
                    <p>Por favor, inicia sesión para ver el catálogo</p>
                    <button
                        onClick={() => keycloak.login()}
                        className="btn btn-primary mt-2"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-64">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <span className="ml-2">Cargando catálogo...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="alert alert-error">
                    {error}
                </div>
            </div>
        );
    }

    // Aplanar todas las películas de todos los catálogos
    const todasLasPeliculas = catalogos.flatMap(catalogo =>
        catalogo.peliculas?.map(pelicula => ({
            ...pelicula,
            catalogoNombre: catalogo.nombre
        })) || []
    );

    const novedades = [...todasLasPeliculas].sort((a, b) =>
        new Date(b.fechaSalida) - new Date(a.fechaSalida)
    );

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
                        {keycloak.authenticated && (
                            <div className="mt-4">
                                <span className="badge badge-secondary">
                                    Bienvenido, {keycloak.tokenParsed?.preferred_username}
                                </span>
                            </div>
                        )}
                    </div>

                    <SearchBar />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-secondary mb-4">Últimas Novedades</h1>

            {/* Carrusel de novedades */}
            <div className="carousel w-full rounded-box mb-8">
                {Array.from({ length: Math.ceil(novedades.length / 3) }).map((_, slideIndex) => {
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
                                        key={pelicula.peliculaId}
                                        to={`/pelicula/${pelicula.peliculaId}`}
                                        className="block"
                                    >
                                        <img
                                            src={'/src/assets/' + pelicula.imagenAmpliada || '/src/assets/movie-4.jpg'}
                                            className="w-full h-96 object-cover rounded-box"
                                            alt={pelicula.titulo}
                                        />
                                    </Link>
                                ))}
                            </div>

                            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
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
                {todasLasPeliculas.map(pelicula => (
                    <Link
                        to={`/pelicula/${pelicula.peliculaId}`}
                        key={pelicula.peliculaId}
                        className="card bg-neutral shadow-xl rounded-2xl transition-transform duration-300 transform hover:scale-105"
                    >
                        <figure className="relative h-64 overflow-hidden rounded-t-2xl">
                            <img
                                src={'/src/assets/' + pelicula.imagenAmpliada || '/src/assets/movie-4.jpg'}
                                alt={pelicula.titulo}
                                className="w-full h-full object-cover"
                            />
                            <div className="badge badge-primary absolute top-2 right-2 text-xs font-semibold">
                                Novedad
                            </div>
                        </figure>
                        <div className="card-body p-4">
                            <h3 className="card-title text-accent text-lg">{pelicula.titulo}</h3>
                            <p className="text-sm text-gray-600">Fecha de salida: {pelicula.fechaSalida}</p>
                            <p className="text-lg font-bold text-primary">${pelicula.precio}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                <span className="font-semibold">Directores:</span> {pelicula.directores?.join(', ') || 'No disponible'}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                <span className="font-semibold">Actores:</span> {pelicula.actores?.slice(0, 3).join(', ')}...
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
