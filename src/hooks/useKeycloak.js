import { useContext } from 'react';
import { KeycloakContext } from './KeycloakProvider.jsx';

export const useKeycloak = () => {
    const context = useContext(KeycloakContext);
    if (!context) {
        throw new Error('useKeycloak debe usarse dentro de KeycloakProvider');
    }
    return context;
};

export default useKeycloak;
