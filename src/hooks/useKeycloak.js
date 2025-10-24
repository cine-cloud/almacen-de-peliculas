import { useState, useEffect } from 'react';
import keycloak from '../config/keycloak.js';

export const useKeycloak = () => {
    const [initialized, setInitialized] = useState(false);
    const [authenticated, setAuthenticated] = useState(keycloak.authenticated || false);

    useEffect(() => {
        // Verificar estado actual inmediatamente
        setAuthenticated(keycloak.authenticated || false);
        setInitialized(true);

        const onAuthSuccess = () => {
            console.log('useKeycloak - Auth Success');
            setAuthenticated(true);
        };

        const onAuthLogout = () => {
            console.log('useKeycloak - Auth Logout');
            setAuthenticated(false);
        };

        const onAuthError = () => {
            console.log('useKeycloak - Auth Error');
            setAuthenticated(false);
        };

        keycloak.onAuthSuccess = onAuthSuccess;
        keycloak.onAuthLogout = onAuthLogout;
        keycloak.onAuthError = onAuthError;

        return () => {
            keycloak.onAuthSuccess = null;
            keycloak.onAuthLogout = null;
            keycloak.onAuthError = null;
        };
    }, []);

    const hasRealmRole = (role) => {
        // Usar tokenParsed de Keycloak
        if (keycloak.tokenParsed && keycloak.tokenParsed.realm_access) {
            return keycloak.tokenParsed.realm_access.roles.includes(role);
        }

        // Fallback al método original
        return keycloak.hasRealmRole ? keycloak.hasRealmRole(role) : false;
    };

    const isAdmin = () => hasRealmRole('admin');
    const isCliente = () => hasRealmRole('cliente');

    const login = () => keycloak.login();
    const logout = () => keycloak.logout();
    const register = () => keycloak.register();
    const getToken = () => keycloak.token;

    return {
        keycloak,
        initialized,
        authenticated,
        hasRealmRole,
        isAdmin,
        isCliente,
        login,
        logout,
        register,
        getToken
    };
};
