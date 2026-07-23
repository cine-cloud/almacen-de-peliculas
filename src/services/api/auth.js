import api from "./api";
import carritoApi from "./carritoApi";

const clientes = [
    api,
    carritoApi
];

export const setAuthToken = (token) => {

    clientes.forEach(cliente => {

        if (token) {
            cliente.defaults.headers.common.Authorization =
                `Bearer ${token}`;
        } else {
            delete cliente.defaults.headers.common.Authorization;
        }

    });

};