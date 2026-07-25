import { useCart } from '@/hooks/useCart.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart, faCreditCard, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import imagenNoDisponible from "../../assets/Imagen_No_Disponible.jpg";
import { carritoService } from "@/services/carritoService";
import { useEffect, useContext, useState } from "react";
import { KeycloakContext } from "../../hooks/KeycloakProvider";
import { descuentoService } from "@/services/descuentoService";


const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, refetchCart } = useCart();
    
    const { authenticated, login, keycloak, isAdmin } = useContext(KeycloakContext);

    const [codigoDescuento, setCodigoDescuento] = useState("");
    const [descuentoAplicado, setDescuentoAplicado] = useState(null);
    const [descuentoError, setDescuentoError] = useState("");
    const [descuentoSuccess, setDescuentoSuccess] = useState("");

    useEffect(() => {
        if (refetchCart) {
            refetchCart();
        }
    }, []);

    const handleApplyDescuento = async () => {
        setDescuentoError("");
        setDescuentoSuccess("");
        if (!codigoDescuento.trim()) {
            setDescuentoError("Por favor ingresa un código.");
            return;
        }

        try {
            const cuponesActivos = await descuentoService.listarActivos();
            const cuponEncontrado = cuponesActivos.find(
                c => c.codigo.trim().toUpperCase() === codigoDescuento.trim().toUpperCase()
            );

            if (cuponEncontrado) {
                setDescuentoAplicado(cuponEncontrado);
                setDescuentoSuccess(`Descuento del ${Math.round(cuponEncontrado.monto)}% aplicado correctamente.`);
            } else {
                setDescuentoError("El código ingresado no existe o no se encuentra activo.");
                setDescuentoAplicado(null);
            }
        } catch (error) {
            console.error("Error al aplicar descuento:", error);
            setDescuentoError("Ocurrió un error al verificar el código.");
        }
    };

    const getDescuentoMonto = () => {
        if (!descuentoAplicado) return 0;
        return getCartTotal() * (descuentoAplicado.monto / 100);
    };

    const getSubtotalConDescuento = () => {
        return getCartTotal() - getDescuentoMonto();
    };

    // Calcular IVA (21%)
    const calculateIVA = () => {
        return getSubtotalConDescuento() * 0.21;
    };

    // Calcular total con IVA
    const getTotalWithIVA = () => {
        return getSubtotalConDescuento() + calculateIVA();
    };
    
    const procesarPago = async () => {

    try {

        if (!authenticated) {
            login();
            return;
        }

        const carritoId = localStorage.getItem("carritoId");

        if (!carritoId) {
            alert("No existe un carrito activo.");
            return;
        }

        const montoDescuento = getDescuentoMonto();
        await carritoService.checkout(carritoId, montoDescuento);

        alert("Compra realizada correctamente");

        clearCart();

        localStorage.removeItem("carritoId");       

    } catch (error) {        
        if (error.response) {
            console.log("STATUS:", error.response.status);
            console.log("DATA:", error.response.data);
        }

        const data = error.response?.data;
        let mensajeError = "Error al procesar la compra";

        if (typeof data === 'string' && data.trim()) {
            mensajeError = data;
        } else if (data && typeof data === 'object') {
            if (data.message && data.message !== "Bad Request") {
                mensajeError = data.message;
            } else if (data.reason && data.reason !== "Bad Request") {
                mensajeError = data.reason;
            } else if (data.error && data.error !== "Bad Request") {
                mensajeError = data.error;
            } else if (data.message === "Bad Request" || data.error === "Bad Request" || error.response?.status === 400) {
                mensajeError = "Stock insuficiente para realizar la compra";
            }
        } else if (error.message) {
            mensajeError = error.message;
        }

        alert(mensajeError);
    }
};

    if (isAdmin && isAdmin()) {
        return (
            <div className="container mx-auto p-6 max-w-6xl text-center py-12">
                <div className="alert alert-error alert-soft max-w-md mx-auto mb-6 flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-error">Acceso Restringido</h2>
                    <p className="text-gray-600 mt-2">Los administradores no realizan compras ni utilizan el carrito.</p>
                </div>
                <Link to="/" className="btn btn-primary">
                    Volver al Catálogo
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="text-center py-12">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-500 mb-6">Agrega algunas películas para comenzar</p>
                    <Link to="/" className="btn btn-primary">
                        Explorar Catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            {/* Título y resumen */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Carrito de Compras</h1>
                <p className="text-gray-600">
                    {cart.length} {cart.length === 1 ? 'película en tu carrito' : 'películas en tu carrito'}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lista de productos */}
                <div className="lg:col-span-2">
                    <div className="bg-base-100 rounded-lg shadow-lg p-6">
                        {cart.map(item => (
                            <div key={item.peliculaId} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0 last:pb-0">
                                <div className="flex gap-4">
                                    {/* Imagen */}
                                    <div className="flex-shrink-0">
                                        <img
                                           src={item.imagenUrl || imagenNoDisponible}
                                            alt={item.titulo}
                                            className="w-24 h-32 object-cover rounded-lg shadow-md"
                                            onError={(e) => {
                                                e.target.src = imagenNoDisponible;
                                            }}
                                        />
                                    </div>

                                    {/* Información de la película */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.titulo}</h3>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <span className="badge badge-outline badge-secondary text-xs">
                                                        {item.generos?.join(', ') || 'Sin género'}
                                                    </span>
                                                    <span className="badge badge-accent text-xs">
                                                        {item.formato || 'DVD + Digital'}
                                                    </span>
                                                    <span className="badge badge-outline text-xs">
                                                        {item.condicion === 'NUEVO' ? 'Nuevo' : 'Usado - Como nuevo'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.peliculaId)}
                                                className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>

                                        {/* Precio y cantidad */}
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-bold text-primary mb-1">
                                                    $ {item.precio?.toFixed(2) || '12,99'} por unidad
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Cantidad:</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.peliculaId, item.quantity - 1)}
                                                            className="btn btn-circle btn-sm btn-outline"
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} />
                                                        </button>
                                                        <span className="text-lg font-semibold w-8 text-center bg-base-200 rounded py-1">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.peliculaId, item.quantity + 1)}
                                                            className="btn btn-circle btn-sm btn-outline"
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gray-900">
                                                   $ {(item.precio * item.quantity)?.toFixed(2) || '12,99'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón vaciar carrito */}
                    <div className="mt-4 text-right">
                        <button
                            onClick={clearCart}
                            className="btn btn-outline btn-error btn-sm"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Vaciar Carrito
                        </button>
                    </div>
                </div>

                {/* Resumen del pedido */}
                <div className="lg:col-span-1">
                    <div className="bg-base-100 rounded-lg shadow-lg sticky top-4">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">Resumen del Pedido</h3>

                            {/* Detalles del precio */}
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-semibold"> $ {getCartTotal().toFixed(2)}</span>
                                </div>

                                {descuentoAplicado && (
                                    <div className="flex justify-between text-sm text-success font-semibold">
                                        <span>Descuento ({Math.round(descuentoAplicado.monto)}%)</span>
                                        <span>- $ {getDescuentoMonto().toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span>Envío</span>
                                    <span className="text-success font-semibold">Gratis</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span>IVA (21%)</span>
                                    <span className="font-semibold"> $ {calculateIVA().toFixed(2)}</span>
                                </div>

                                <div className="border-t border-gray-300 pt-3 mt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-primary"> $ {getTotalWithIVA().toFixed(2)} </span>
                                    </div>
                                </div>
                            </div>

                            {/* Campo de código de descuento */}
                            <div className="mb-6 p-4 bg-base-200 rounded-lg border border-base-300">
                                <label className="block text-sm font-semibold mb-2">
                                    ¿Tienes un cupón de descuento?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="CÓDIGO"
                                        value={codigoDescuento}
                                        onChange={(e) => setCodigoDescuento(e.target.value)}
                                        className="input input-bordered input-sm flex-grow font-mono uppercase"
                                    />
                                    <button
                                        onClick={handleApplyDescuento}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                {descuentoError && (
                                    <p className="text-error text-xs mt-2 font-medium">{descuentoError}</p>
                                )}
                                {descuentoSuccess && (
                                    <p className="text-success text-xs mt-2 font-medium">{descuentoSuccess}</p>
                                )}
                            </div>

                            {/* Botón de pago */}
                            <button
                                onClick={procesarPago}
                                className="btn btn-primary btn-block text-lg font-semibold py-3"
                            >
                                <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                Proceder al Pago
                            </button>

                            {/* Envío gratuito */}
                            <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
                                <div className="flex items-center gap-2 text-success">
                                    <FontAwesomeIcon icon={faTruck} />
                                    <span className="text-sm font-semibold">Envío gratuito en todos los pedidos</span>
                                </div>
                            </div>

                            {/* Seguir comprando */}
                            <Link to="/" className="btn btn-outline btn-block mt-4">
                                Seguir Comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-base-200 rounded-lg">
                    <FontAwesomeIcon icon={faTruck} className="text-2xl text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Envío Gratuito</h4>
                    <p className="text-sm text-gray-600">En todos los pedidos sin mínimo de compra</p>
                </div>

                <div className="text-center p-4 bg-base-200 rounded-lg">
                    <FontAwesomeIcon icon={faCreditCard} className="text-2xl text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Pago Seguro</h4>
                    <p className="text-sm text-gray-600">Transacciones protegidas y cifradas</p>
                </div>

                <div className="text-center p-4 bg-base-200 rounded-lg">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Devolución Fácil</h4>
                    <p className="text-sm text-gray-600">30 días para cambiar de opinión</p>
                </div>
            </div>
        </div>
    );
};

export default Cart;
