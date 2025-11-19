import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Cargar carrito desde localStorage al inicializar
    useEffect(() => {
        const savedCart = localStorage.getItem('movieCart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('movieCart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (movie) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.peliculaId === movie.peliculaId);

            if (existingItem) {
                return prevCart.map(item =>
                    item.peliculaId === movie.peliculaId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...movie, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (movieId) => {
        setCart(prevCart => prevCart.filter(item => item.peliculaId !== movieId));
    };

    const updateQuantity = (movieId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(movieId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.peliculaId === movieId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
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
        getCartItemsCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};
