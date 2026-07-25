
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faFilm, faSignOutAlt, faUser, faUsers, faSignInAlt, faUserPlus, faTag } from "@fortawesome/free-solid-svg-icons";
import { useKeycloak } from "@/hooks/useKeycloak.js";
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/hooks/useCart.jsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMovieModal } from "@/context/MovieModalContext";

export default function Header() {

  const { keycloak, initialized, authenticated, isAdmin, isCliente } = useKeycloak();
  const { getCartItemsCount } = useCart();
  const { isModalOpen, openModal } = useMovieModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar permisos basados en Realm Roles
  const canAddMovies = authenticated && isAdmin();

  const handleAddMovie = () => {
    openModal();
    navigate("/");
  };

  const handleLogin = () => {
    keycloak.login();
  };

  const handleRegister = () => {
    keycloak.register();
  };

  const handleLogout = () => {
    localStorage.removeItem("carritoId");
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  const handleAccountManagement = () => {
    keycloak.accountManagement();
  };

  if (!initialized) {
    return (
      <header className="sticky top-0 z-10 bg-base-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-1">
          {/* Logo y título */}
          <Link to="/" className="flex items-center gap-4">
            <img
              src="/src/assets/Logo-cinecloud.png"
              alt="Logo Cine Cloud"
              className="h-20 w-auto cursor-pointer"
            />
          </Link>
          <div className="loading loading-spinner loading-sm"></div>
        </div>
      </header>
    );
  }

  const isDescuentosActive = location.pathname === "/admin/descuentos";
  const isHistorialActive = location.pathname === "/historial";

  return (
    <header className="sticky top-0 z-10 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-1">

        {/* Logo y título */}
        <Link to="/" className="flex items-center gap-4">
          <img
            src="/src/assets/Logo-cinecloud.png"
            alt="Logo Cine Cloud"
            className="h-20 w-auto cursor-pointer"
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Botón para agregar película - Solo admin puede agregar */}
          {canAddMovies && (
            <button
              onClick={handleAddMovie}
              className={`btn btn-sm flex items-center gap-2 ${
                isModalOpen ? "btn-primary" : "btn-outline btn-primary"
              }`}
            >
              <FontAwesomeIcon icon={faFilm} />
              Agregar Película
            </button>
          )}

          {/* Botón para gestionar descuentos - Solo admin */}
          {canAddMovies && (
            <Link
              to="/admin/descuentos"
              className={`btn btn-sm flex items-center gap-2 ${
                isDescuentosActive ? "btn-primary" : "btn-outline btn-primary"
              }`}
            >
              <FontAwesomeIcon icon={faTag} />
              Gestionar Descuentos
            </Link>
          )}

          {/* Enlace al carrito - Oculto para admin */}
          {!isAdmin() && (
            <Link to="/carrito" className="btn btn-ghost btn-circle relative">
              <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 badge badge-primary badge-sm">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
          )}

          {/* BOTÓN HISTORIAL */}
          {authenticated && (
            <Link
              to="/historial"
              className={`btn btn-sm flex items-center gap-2 ${
                isHistorialActive ? "btn-primary" : "btn-outline btn-primary"
              }`}
            >
              Historial
            </Link>
          )}

          {/* Información del usuario */}
          {authenticated ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-center font-semibold leading-none">
                  <span className="flex items-center justify-center">
                    {keycloak.tokenParsed?.preferred_username?.[0]?.toUpperCase() ||
                      keycloak.tokenParsed?.given_name?.[0]?.toUpperCase() || (
                        <FontAwesomeIcon icon={faUser} />
                      )}
                  </span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span className="text-xs">
                    {keycloak.tokenParsed?.preferred_username ||
                      keycloak.tokenParsed?.name}
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
            // BOTONES PARA USUARIOS NO AUTENTICADOS
            <div className="flex gap-2">
              <button
                onClick={handleRegister}
                className="btn btn-outline btn-primary btn-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                Registrarse
              </button>
              <button
                onClick={handleLogin}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
