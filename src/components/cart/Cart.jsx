import { useCart } from '@/hooks/useCart.jsx';
import { useKeycloak } from '@/hooks/useKeycloak.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faMinus, faShoppingCart, faCreditCard, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import ImageWithFallback from '@/components/shared/ImageWithFallback.jsx';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const { authenticated, login } = useKeycloak();

    // Calcular IVA (21%)
    const calculateIVA = () => {
        return getCartTotal() * 0.21;
    };

    // Calcular total con IVA
    const getTotalWithIVA = () => {
        return getCartTotal() + calculateIVA();
    };

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
                                        <ImageWithFallback
                                            src={item.imagenAmpliada}
                                            alt={item.titulo}
                                            className="w-24 h-32 object-cover rounded-lg shadow-md"
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

                            {/* Botón de pago */}
                            {authenticated ? (
                                <button className="btn btn-primary btn-block text-lg font-semibold py-3">
                                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                    Proceder al Pago
                                </button>
                            ) : (
                                <button
                                    onClick={login}
                                    className="btn btn-primary btn-block text-lg font-semibold py-3"
                                >
                                    <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                                    Iniciar Sesión para Comprar
                                </button>
                            )}

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
