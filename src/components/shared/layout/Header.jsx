import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt, faSignInAlt, faUserPlus, faFilm, faCrown, faUsers } from "@fortawesome/free-solid-svg-icons";
import MovieForm from "@/components/catalog/MovieForm.jsx";
import { useKeycloak } from "@/hooks/useKeycloak.js";

export default function Header() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { keycloak, initialized, authenticated, isAdmin, isCliente } = useKeycloak();

    // Verificar permisos basados en Realm Roles
    const canAddMovies = initialized && authenticated && isAdmin();

    const handleAddMovie = () => {
        if (!authenticated) {
            keycloak.login();
            return;
        }
        setIsModalOpen(true);
    };

    const handleLogin = () => {
        keycloak.login();
    };

    const handleRegister = () => {
        keycloak.register();
    };

    const handleLogout = () => {
        keycloak.logout();
    };

    const handleAccountManagement = () => {
        keycloak.accountManagement();
    };

    if (!initialized) {
        return (
            <header className="sticky top-0 z-10 bg-base-100 shadow-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="loading loading-spinner loading-sm"></div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-10 bg-base-100 shadow-sm">
            <div className="flex items-center justify-between p-4">
                {/* Logo y título */}
                <div className="flex items-center gap-4">
                    <img src="/src/assets/logo.png" alt="logo" className="h-8 w-auto" />
                    <h1 className="text-2xl font-bold text-primary">Cine Cloud</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Botón para agregar película - Solo admin puede agregar */}
                    {canAddMovies && (
                        <button
                            onClick={handleAddMovie}
                            className="btn btn-primary btn-sm flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faFilm} />
                            Agregar Película
                        </button>
                    )}

                    {/* Información del usuario */}
                    {authenticated ? (
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-circle avatar flex items-center justify-center"
                            >
                                <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                    {keycloak.tokenParsed?.preferred_username?.[0]?.toUpperCase() ||
                                        keycloak.tokenParsed?.given_name?.[0]?.toUpperCase() ||
                                        <FontAwesomeIcon icon={faUser} />}
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li className="menu-title">
                                    <span className="text-xs">
                                        {keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.name}
                                        {isAdmin() && (
                                            <span className="badge badge-sm badge-secondary ml-2">
                                                <FontAwesomeIcon icon={faCrown} className="mr-1" />
                                                Admin
                                            </span>
                                        )}
                                        {isCliente() && !isAdmin() && (
                                            <span className="badge badge-sm badge-primary ml-2">
                                                <FontAwesomeIcon icon={faUsers} className="mr-1" />
                                                Cliente
                                            </span>
                                        )}
                                    </span>
                                </li>
                                <li>
                                    <button onClick={handleAccountManagement}>
                                        <FontAwesomeIcon icon={faUser} />
                                        Mi Cuenta
                                    </button>
                                </li>

                                {canAddMovies && (
                                    <li>
                                        <button onClick={handleAddMovie}>
                                            <FontAwesomeIcon icon={faFilm} />
                                            Agregar Película
                                        </button>
                                    </li>
                                )}

                                <li className="divider my-1"></li>
                                <li>
                                    <button onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt}/>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de agregar película - Solo visible para admin */}
            {isModalOpen && canAddMovies && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-primary text-lg w-8 h-8 flex items-center justify-center"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-primary">
                            Agregar Nueva Película
                        </h2>
                        <MovieForm
                            onSave={(movieData) => {
                                console.log('Película guardada:', movieData);
                                setIsModalOpen(false);
                            }}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
