// hooks/KeycloakProvider.jsx
import { useState, useEffect, createContext } from 'react';
import keycloak from '../config/keycloak.js';

export const KeycloakContext = createContext();

const KeycloakProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                console.log('Inicializando Keycloak...');

                const auth = await keycloak.init({
                    onLoad: 'check-sso',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    checkLoginIframe: false,
                    pkceMethod: 'S256',
                    enableLogging: true
                });

                console.log('Keycloak inicializado. Autenticado:', auth);

                setAuthenticated(auth);
                setInitialized(true);

                keycloak.onAuthSuccess = () => {
                    console.log('Auth Success');
                    setAuthenticated(true);
                };

                keycloak.onAuthError = () => {
                    console.log('Auth Error');
                    setAuthenticated(false);
                };

                keycloak.onAuthLogout = () => {
                    console.log('Auth Logout');
                    setAuthenticated(false);
                };

                keycloak.onTokenExpired = () => {
                    keycloak.updateToken(30).catch(() => {
                        setAuthenticated(false);
                    });
                };

            } catch (error) {
                console.error('Error inicializando Keycloak:', error);
                setInitialized(true);
                setAuthenticated(false);
            }
        };

        initKeycloak();
    }, []);

    const value = {
        keycloak,
        initialized,
        authenticated,
        hasRealmRole: (role) => {
            if (keycloak.tokenParsed && keycloak.tokenParsed.realm_access) {
                return keycloak.tokenParsed.realm_access.roles.includes(role);
            }
            return keycloak.hasRealmRole ? keycloak.hasRealmRole(role) : false;
        },
        isAdmin: () => {
            if (keycloak.tokenParsed && keycloak.tokenParsed.realm_access) {
                return keycloak.tokenParsed.realm_access.roles.includes('admin');
            }
            return keycloak.hasRealmRole ? keycloak.hasRealmRole('admin') : false;
        },
        isCliente: () => {
            if (keycloak.tokenParsed && keycloak.tokenParsed.realm_access) {
                return keycloak.tokenParsed.realm_access.roles.includes('cliente');
            }
            return keycloak.hasRealmRole ? keycloak.hasRealmRole('cliente') : false;
        },
        login: () => keycloak.login(),
        logout: () => keycloak.logout(),
        register: () => keycloak.register(),
        getToken: () => keycloak.token
    };

    if (!initialized) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <span className="ml-2">Inicializando seguridad...</span>
            </div>
        );
    }

    return (
        <KeycloakContext.Provider value={value}>
            {children}
        </KeycloakContext.Provider>
    );
};

export default KeycloakProvider;
