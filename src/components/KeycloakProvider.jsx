import { useState, useEffect } from 'react';
import keycloak from '../config/keycloak.js';

const KeycloakProvider = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                console.log('Inicializando Keycloak...');

                const authenticated = await keycloak.init({
                    onLoad: 'login-required',
                    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
                    checkLoginIframe: false,
                    pkceMethod: 'S256',
                    enableLogging: true // Para más detalles
                });

                console.log('Keycloak inicializado. Autenticado:', authenticated);
                console.log('Token disponible:', !!keycloak.token);
                console.log('Usuario:', keycloak.tokenParsed);
                console.log('Client ID:', keycloak.clientId);

                // Configurar event listeners
                keycloak.onReady = (authenticated) => {
                    console.log('Keycloak Ready - Autenticado:', authenticated);
                    setAuthenticated(authenticated);
                };

                keycloak.onAuthSuccess = () => {
                    console.log('Auth Success - Token:', !!keycloak.token);
                    setAuthenticated(true);
                };

                keycloak.onAuthError = (error) => {
                    console.error('Auth Error:', error);
                    setAuthenticated(false);
                };

                keycloak.onAuthLogout = () => {
                    console.log('Auth Logout');
                    setAuthenticated(false);
                };

                keycloak.onTokenExpired = () => {
                    console.log('Token expired');
                    keycloak.updateToken(30).then(refreshed => {
                        if (refreshed) {
                            console.log('Token refreshed successfully');
                        } else {
                            console.log('Token refresh failed');
                            setAuthenticated(false);
                        }
                    }).catch(error => {
                        console.error('Error refreshing token:', error);
                        setAuthenticated(false);
                    });
                };

                setAuthenticated(authenticated);
                setInitialized(true);

            } catch (error) {
                console.error('Error inicializando Keycloak:', error);
                console.error('Error details:', error.message);
                setInitialized(true);
            }
        };

        if (!initialized) {
            initKeycloak();
        }
    }, [initialized]);

    if (!initialized) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <span className="ml-2">Inicializando seguridad...</span>
            </div>
        );
    }

    return children;
};

export default KeycloakProvider;
