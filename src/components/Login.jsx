import { useKeycloak} from "@/hooks/useKeycloak.js";

const LoginPage = () => {
    const { keycloak, authenticated } = useKeycloak();

    if (authenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64">
                <div className="alert alert-success mb-4">
                    Ya estás autenticado
                </div>
                <button
                    onClick={() => keycloak.logout()}
                    className="btn btn-outline"
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-64 p-4">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Bienvenido</h1>
                <p className="text-gray-600">Inicia sesión para continuar</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={() => keycloak.login()}
                    className="btn btn-primary w-full"
                >
                    Iniciar Sesión
                </button>

                <button
                    onClick={() => keycloak.register()}
                    className="btn btn-outline w-full"
                >
                    Registrarse
                </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Cliente: {keycloak.clientId}</p>
                <p>Realm: {keycloak.realm}</p>
            </div>
        </div>
    );
};

export default LoginPage;
