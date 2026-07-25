import { Link } from 'react-router-dom';
import SearchBar from "../shared/SearchBar.jsx";
import { peliculaService } from '@/services/peliculaService';
import { useKeycloak } from "@/hooks/useKeycloak.js";
import imagenNoDisponible from "../../assets/Imagen_No_Disponible.jpg";
import { useCart } from '@/hooks/useCart.jsx';
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const MovieCatalog = forwardRef(({ onEditar }, ref) => {
    const [peliculas, setPeliculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { keycloak, initialized, isAdmin } = useKeycloak();
    const esAdministrador = initialized && isAdmin();
    console.log("Debug esAdministrador:", {
        initialized,
        authenticated: keycloak?.authenticated,
        roles: keycloak?.tokenParsed?.realm_access?.roles,
        isAdminResult: isAdmin ? isAdmin() : "no-function",
        esAdministrador
    });
    const { addToCart } = useCart();
    const [notification, setNotification] = useState(null);

    const handleComprar = async (pelicula) => {
        const res = await addToCart(pelicula);
        if (res) {
            setNotification(res);
            setTimeout(() => {
                setNotification(null);
            }, 3500);
        }
    };

    const cargarCatalogos = async () => {
        try {
            setLoading(true);

            const data = await peliculaService.listar();

            setPeliculas(data);
            setError(null);

        } catch (err) {
            console.error("Error al cargar catálogo:", err);
            setError("Error al cargar el catálogo");
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        reload() {
            cargarCatalogos();
        }
    }));

    useEffect(() => {
        cargarCatalogos();
    }, []);

    // Solo esperar inicialización de Keycloak, no autenticación
    if (!initialized) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-64">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <span className="ml-2">Inicializando...</span>
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
    const todasLasPeliculas = peliculas || [];

    const novedades = [...todasLasPeliculas].sort((a, b) =>
        new Date(b.fechaSalida) - new Date(a.fechaSalida)
    );

    return (
        <div className="container mx-auto p-4">
            {/* Toast de notificación de stock / carrito */}
            {notification && (
                <div className="toast toast-top toast-end z-50">
                    <div className={`alert ${notification.success ? 'alert-success' : 'alert-error text-white'} alert-soft flex shadow-xl border border-border`}>
                        <span className="font-semibold text-sm">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="bg-card border-border">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-3">
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

            {/* Sección de bienvenida para usuarios no autenticados */}
            {!keycloak.authenticated && (
                <div className="alert alert-info alert-soft mb-6">
                    <div className="flex items-center justify-between" style={{ 'font-size': '1rem' }}>
                        <div>
                            <span className="font-bold text-primary">¡Bienvenido!</span>
                            <span className="ml-2 text-primary">Explora nuestro catálogo. Inicia sesión para más funciones.</span>
                        </div>
                        <button
                            onClick={() => keycloak.login()}
                            style={{ 'font-size': '1rem' }}
                            className="btn btn-ghost btn-sm text-primary"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            )}

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
                                            src={pelicula.imagenAmpliada || imagenNoDisponible}
                                            alt={pelicula.titulo}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = imagenNoDisponible;
                                            }}
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
                    <div
                        key={pelicula.peliculaId}
                        className="card bg-neutral shadow-xl rounded-2xl transition-transform duration-300 transform hover:scale-105"
                    >
                        <figure className="relative h-64 overflow-hidden rounded-t-2xl">
                            <img
                                src={pelicula.imagenAmpliada || imagenNoDisponible}
                                alt={pelicula.titulo}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = imagenNoDisponible;
                                }}
                            />
                        </figure>
                        <div className="card-body p-4">
                            <h3 className="card-title text-accent text-lg">{pelicula.titulo}</h3>
                            <p className="text-sm text-gray-600">Fecha de salida: {pelicula.fechaSalida}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-bold text-primary">${pelicula.precio}</span>
                                {pelicula.stock != null && pelicula.stock > 0 ? (
                                    <span className="badge badge-success badge-sm font-semibold">Stock: {pelicula.stock}</span>
                                ) : (
                                    <span className="badge badge-error badge-sm text-white font-semibold">Sin stock</span>
                                )}
                            </div>
                            <div className="flex items-start gap-1.5 text-sm text-gray-700 mt-2">
                                <span className="font-semibold shrink-0">Directores:</span>
                                <span>{pelicula.directores?.join(', ') || 'No disponible'}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-sm text-gray-700">
                                <span className="font-semibold shrink-0">Actores:</span>
                                <span>{pelicula.actores || "No disponible"}</span>
                            </div>
                            <div className="flex justify-between items-center mt-4">

                                <Link
                                    to={`/pelicula/${pelicula.peliculaId}`}
                                    className="btn btn-primary rounded-full btn-sm"
                                >
                                    Ver detalles
                                </Link>
                                {esAdministrador && (
                                    <button
                                        onClick={() => onEditar?.(pelicula)}
                                        className="btn btn-primary rounded-full btn-sm"
                                    >
                                        Editar
                                    </button>
                                )}

                                {!isAdmin() && (
                                    pelicula.stock != null && pelicula.stock > 0 ? (
                                        <button
                                            onClick={() => handleComprar(pelicula)}
                                            className="btn btn-outline btn-secondary rounded-full btn-sm"
                                        >
                                            Comprar
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="btn btn-disabled btn-sm rounded-full cursor-not-allowed opacity-60"
                                        >
                                            Sin stock
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default MovieCatalog;
