import { createContext, useContext, useState, useEffect } from 'react';

import { carritoService } from "../services/carritoService";

import { KeycloakContext } from "./KeycloakProvider";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const { authenticated, keycloak } = useContext(KeycloakContext);

    const asociarCarritoAlUsuario = async () => {

        const usuarioId = keycloak.tokenParsed?.preferred_username;

        const carritoId = localStorage.getItem("carritoId");

        let carrito;

        if (carritoId) {

            // Existe un carrito anónimo.
            // Lo asociamos o fusionamos con el del usuario.
            carrito = await carritoService.asociarOFusionar(
                carritoId,
                usuarioId
            );

        } else {

            // No existe carrito anónimo.
            // Recuperamos el carrito abierto del usuario.
            carrito = await carritoService.obtenerCarritoUsuario(
                usuarioId
            );

        }

        localStorage.setItem("carritoId", carrito.id);

        setCart(
            carrito.items.map(item => ({
                peliculaId: item.peliculaId,
                titulo: item.tituloSnapshot,
                imagenUrl: item.imagenUrl,
                precio: item.precioUnitario,
                quantity: item.cantidad
            }))
        );

    };

    // El carrito se cargará desde el backend en el siguiente paso.
    // El carrito se cargará desde el backend en el siguiente paso.
    useEffect(() => {

        const inicializarCarrito = async () => {

            console.log("Entró al useEffect del carrito");

            let carritoId = localStorage.getItem("carritoId");

            console.log("Inicializando carrito");

            if (authenticated) {

                const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
                if (roles.includes("admin")) {
                    setCart([]);
                    return;
                }

                await asociarCarritoAlUsuario();

                return;

            }

            if (!carritoId) {

                const carrito = await carritoService.crearCarritoAnonimo();

                carritoId = carrito.id;

                localStorage.setItem("carritoId", carritoId);

                setCart([]);

                return;

            }
            
            try {

                const carrito = await carritoService.obtenerCarrito(carritoId);

                setCart(
                    carrito.items.map(item => ({
                        peliculaId: item.peliculaId,
                        titulo: item.tituloSnapshot,
                        imagenUrl: item.imagenUrl,
                        precio: item.precioUnitario,
                        quantity: item.cantidad
                    }))
                );

            } catch (error) {

                console.error("No se pudo recuperar el carrito", error);

                localStorage.removeItem("carritoId");

            }

        };

        inicializarCarrito();

    }, [authenticated]);

    const obtenerOCrearCarritoId = async () => {
        let carritoId = localStorage.getItem("carritoId");
        if (carritoId) return carritoId;

        if (authenticated) {
            const usuarioId = keycloak.tokenParsed?.preferred_username;
            if (usuarioId) {
                const carrito = await carritoService.obtenerCarritoUsuario(usuarioId);
                carritoId = carrito.id;
                localStorage.setItem("carritoId", carritoId);
                return carritoId;
            }
        }

        const carritoAnonimo = await carritoService.crearCarritoAnonimo();
        carritoId = carritoAnonimo.id;
        localStorage.setItem("carritoId", carritoId);
        return carritoId;
    };

    const addToCart = async (movie) => {
        const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
        if (roles.includes("admin")) {
            return { success: false, message: "Los administradores no pueden agregar productos al carrito." };
        }

        const stockDisponible = movie?.stock ?? 0;
        if (stockDisponible <= 0) {
            return {
                success: false,
                message: `No hay stock suficiente "${movie?.titulo || 'esta película'}" para la compra.`
            };
        }

        const itemExistente = cart.find(i => i.peliculaId === movie.peliculaId);
        const cantidadEnCarrito = itemExistente ? itemExistente.quantity : 0;

        if (cantidadEnCarrito + 1 > stockDisponible) {
            return {
                success: false,
                message: `No hay stock suficiente "${movie.titulo}" para la compra.`
            };
        }

        try {
            const carritoId = await obtenerOCrearCarritoId();

            await carritoService.agregarItem(
                carritoId,
                movie.peliculaId,
                1
            );

            const carrito = await carritoService.obtenerCarrito(carritoId);

            setCart(
                carrito.items.map(item => ({
                    peliculaId: item.peliculaId,
                    titulo: item.tituloSnapshot,
                    imagenUrl: item.imagenUrl,
                    precio: item.precioUnitario,
                    quantity: item.cantidad
                }))
            );

            console.log("Película agregada al carrito.");
            return { success: true, message: `¡"${movie.titulo}" agregada al carrito!` };

        } catch (error) {
            console.error("Error agregando al carrito:", error);
            const msg = error.response?.data?.message || "No se pudo agregar la película al carrito.";
            return { success: false, message: msg };
        }
    };

    const removeFromCart = async (movieId) => {
        try {
            const carritoId = await obtenerOCrearCarritoId();
            await carritoService.eliminarItem(carritoId, movieId);

            const carrito = await carritoService.obtenerCarrito(carritoId);

            setCart(
                carrito.items.map(item => ({
                    peliculaId: item.peliculaId,
                    titulo: item.tituloSnapshot,
                    imagenUrl: item.imagenUrl,
                    precio: item.precioUnitario,
                    quantity: item.cantidad
                }))
            );
        } catch (error) {
            console.error("Error eliminando película:", error);
        }
    };

    const updateQuantity = async (movieId, newQuantity) => {
        try {
            const carritoId = await obtenerOCrearCarritoId();
            if (newQuantity < 1) {
                await removeFromCart(movieId);
                return;
            }
            await carritoService.actualizarCantidad(
                carritoId,
                movieId,
                newQuantity
            );
            const carrito = await carritoService.obtenerCarrito(carritoId);
            setCart(
                carrito.items.map(item => ({
                    peliculaId: item.peliculaId,
                    titulo: item.tituloSnapshot,
                    imagenUrl: item.imagenUrl,
                    precio: item.precioUnitario,
                    quantity: item.cantidad
                }))
            );
        } catch (error) {
            console.error("Error actualizando cantidad:", error);
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const refetchCart = async () => {
        try {
            const carritoId = await obtenerOCrearCarritoId();
            const carrito = await carritoService.obtenerCarrito(carritoId);
            setCart(
                carrito.items.map(item => ({
                    peliculaId: item.peliculaId,
                    titulo: item.tituloSnapshot,
                    imagenUrl: item.imagenUrl,
                    precio: item.precioUnitario,
                    quantity: item.cantidad
                }))
            );
        } catch (error) {
            console.error("Error refrescando carrito:", error);
        }
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        refetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};
