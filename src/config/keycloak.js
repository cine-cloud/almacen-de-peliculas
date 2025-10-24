import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:9090',
    realm: 'cinecloud',
    clientId: 'cine-cloud-web'
});

export default keycloak;
