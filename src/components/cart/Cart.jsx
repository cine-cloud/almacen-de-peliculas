import { useCart } from '@/hooks/useCart.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart, faCreditCard, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import imagenNoDisponible from "../../assets/Imagen_No_Disponible.jpg";
import { carritoService } from "@/services/carritoService";
import { useEffect, useContext, useState } from "react";
import { KeycloakContext } from "../../hooks/KeycloakProvider";
import { descuentoService } from "@/services/descuentoService";


const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal, refetchCart } = useCart();

    const { authenticated, login, register, keycloak, isAdmin } = useContext(KeycloakContext);

    const [codigoDescuento, setCodigoDescuento] = useState("");
    const [descuentoAplicado, setDescuentoAplicado] = useState(null);
    const [descuentoError, setDescuentoError] = useState("");
    const [descuentoSuccess, setDescuentoSuccess] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (refetchCart) {
            refetchCart();
        }
    }, []);

    const handleUpdateQuantity = async (peliculaId, newQuantity) => {
        const res = await updateQuantity(peliculaId, newQuantity);
        if (res && !res.success && res.message) {
            setNotification({
                success: false,
                message: res.message
            });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleApplyDescuento = async () => {
        setDescuentoError("");
        setDescuentoSuccess("");
        if (!codigoDescuento.trim()) {
            setDescuentoError("Por favor ingresa un código.");
            return;
        }

        try {
            const codigoClean = codigoDescuento.trim().toUpperCase();

            // Verificar si el cliente ya utilizó este cupón en alguna compra anterior
            const usuarioId = keycloak?.tokenParsed?.preferred_username || keycloak?.subject || keycloak?.tokenParsed?.sub;
            if (authenticated && usuarioId) {
                try {
                    const resHistorial = await fetch(`http://localhost:8080/historial/${usuarioId}`);
                    if (resHistorial.ok) {
                        const comprasPasadas = await resHistorial.json();
                        const yaUsado = comprasPasadas.some(
                            compra => compra.codigoDescuento && compra.codigoDescuento.trim().toUpperCase() === codigoClean
                        );
                        if (yaUsado) {
                            setDescuentoError(`Ya has utilizado el cupón "${codigoClean}" en una compra anterior. Cada cupón solo puede ser utilizado una única vez por cliente.`);
                            setDescuentoAplicado(null);
                            return;
                        }
                    }
                } catch (err) {
                    console.error("Error al consultar historial para cupones:", err);
                }
            }

            const cuponesActivos = await descuentoService.listarActivos();
            const cuponEncontrado = cuponesActivos.find(
                c => c.codigo.trim().toUpperCase() === codigoClean
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
                setShowAuthModal(true);
                return;
            }

            const carritoId = localStorage.getItem("carritoId");

            if (!carritoId) {
                setNotification({
                    success: false,
                    message: "No existe un carrito activo."
                });
                setTimeout(() => setNotification(null), 4000);
                return;
            }

            const montoDescuento = getDescuentoMonto();
            await carritoService.checkout(carritoId, montoDescuento, descuentoAplicado?.codigo);

            clearCart();
            localStorage.removeItem("carritoId");
            setPurchaseSuccess(true);
            setNotification({
                success: true,
                message: "¡Compra realizada con éxito! Tu pedido ha sido registrado correctamente."
            });
            setTimeout(() => setNotification(null), 4000);

        } catch (error) {
            if (error.response) {
                console.log("STATUS:", error.response.status);
                console.log("DATA:", error.response.data);
            }

            const data = error.response?.data;
            let rawErrorStr = "";

            if (typeof data === 'string') {
                rawErrorStr = data;
            } else if (data && typeof data === 'object') {
                rawErrorStr = [data.detail, data.message, data.reason, data.error].filter(Boolean).join(" ");
            } else if (error.message) {
                rawErrorStr = error.message;
            }

            let mensajeError = "Error al procesar la compra";

            // Intentar extraer el título exacto enviado por el backend
            const matchQuote = rawErrorStr.match(/No hay stock suficiente "([^"]+)"/i) ||
                               rawErrorStr.match(/No hay stock suficiente '([^']+)'/i) ||
                               rawErrorStr.match(/Stock insuficiente para (?:la )?película '([^']+)'/i) ||
                               rawErrorStr.match(/Stock insuficiente para '([^']+)'/i);

            if (matchQuote && matchQuote[1]) {
                mensajeError = `No hay stock suficiente "${matchQuote[1]}" para la compra.`;
            } else if (rawErrorStr.includes("No hay stock suficiente") || rawErrorStr.includes("Stock insuficiente") || error.response?.status === 400) {
                mensajeError = "No hay stock suficiente para la compra.";
            } else if (rawErrorStr && !rawErrorStr.includes("Bad Request")) {
                mensajeError = rawErrorStr;
            }

            setNotification({
                success: false,
                message: mensajeError
            });
            setTimeout(() => setNotification(null), 4000);
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

    if (purchaseSuccess) {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center py-12">
                {notification && (
                    <div className="toast toast-top toast-end z-50">
                        <div className="alert alert-success alert-soft flex shadow-xl border border-border">
                            <span className="font-semibold text-sm">{notification.message}</span>
                        </div>
                    </div>
                )}

                <div className="bg-base-100 rounded-3xl p-8 shadow-2xl border border-base-300 space-y-6 animate-scale-up">
                    <div className="w-20 h-20 bg-success/15 text-success rounded-full mx-auto flex items-center justify-center text-4xl font-bold shadow-inner">
                        ✓
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-[#471F16]">
                            ¡Gracias por tu compra!
                        </h2>
                        <p className="text-stone-600 text-base max-w-md mx-auto">
                            Tu pedido ha sido procesado y registrado correctamente. Puedes revisar el detalle de tu compra en tu historial.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/historial" className="btn btn-primary font-semibold px-6 shadow-md">
                            Ver Historial de Compras
                        </Link>
                        <Link to="/" className="btn btn-outline border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold px-6">
                            Volver al Catálogo
                        </Link>
                    </div>
                </div>
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
            {notification && (
                <div className="toast toast-top toast-end z-50">
                    <div className={`alert ${notification.success ? 'alert-success' : 'alert-error text-white'} alert-soft flex shadow-xl border border-border`}>
                        <span className="font-semibold text-sm">{notification.message}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center border-b border-stone-200 pb-4 mb-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-stone-600 hover:text-primary transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver al Catálogo</span>
                </Link>
            </div>

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
                                                            onClick={() => handleUpdateQuantity(item.peliculaId, item.quantity - 1)}
                                                            className="btn btn-circle btn-sm btn-outline"
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} />
                                                        </button>
                                                        <span className="text-lg font-semibold w-8 text-center bg-base-200 rounded py-1">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.peliculaId, item.quantity + 1)}
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

            {/* Modal de confirmación para usuarios no autenticados */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-base-100 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-base-300 animate-scale-up text-center">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center text-xl font-bold">
                            <FontAwesomeIcon icon={faShoppingCart} />
                        </div>
                        <h3 className="text-xl font-bold text-base-content">
                            ¿Deseas continuar con tu compra?
                        </h3>
                        <p className="text-sm text-base-content/80">
                            Para proceder al pago debes estar identificado. Inicia sesión si ya posees una cuenta, o bien regístrate para crear una.
                        </p>
                        <div className="flex flex-col gap-3 pt-3">
                            <button
                                type="button"
                                className="btn btn-primary w-full font-semibold"
                                onClick={() => {
                                    setShowAuthModal(false);
                                    login();
                                }}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline btn-primary w-full font-semibold"
                                onClick={() => {
                                    setShowAuthModal(false);
                                    register();
                                }}
                            >
                                Registrarse
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                                onClick={() => setShowAuthModal(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
