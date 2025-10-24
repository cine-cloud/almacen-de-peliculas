import { useKeycloak} from "@/hooks/useKeycloak.js";

const ProtectedRoute = ({ children, role }) => {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (!keycloak.authenticated) {
        keycloak.login();
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p>Redirigiendo al login...</p>
                </div>
            </div>
        );
    }

    // Verificar rol si se especifica
    if (role && keycloak.tokenParsed?.realm_access?.roles) {
        const hasRole = keycloak.tokenParsed.realm_access.roles.includes(role);
        if (!hasRole) {
            return (
                <div className="flex justify-center items-center min-h-64">
                    <div className="alert alert-error">
                        No tienes permisos para acceder a esta página.
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;
