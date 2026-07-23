import axios from "axios";

const carritoApi = axios.create({
    baseURL: "http://localhost:8082",
});

export default carritoApi;