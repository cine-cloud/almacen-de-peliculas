import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KeycloakProvider from './hooks/KeycloakProvider.jsx';
import MovieCatalog from './components/catalog/MovieCatalog.jsx';
import MovieDetail from './components/catalog/MovieDetail.jsx';
import Header from './components/shared/layout/Header.jsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { CartProvider } from '@/hooks/useCart.jsx';
import Cart from './components/cart/Cart.jsx';

library.add(faShareNodes);

function App() {
    return (
        <KeycloakProvider>
            <CartProvider>
                <Router>
                    <Header />
                    <div className="bg-base-100 text-base-content min-h-screen">
                        <Routes>
                            <Route path="/" element={<MovieCatalog />} />
                            <Route path="/pelicula/:id" element={<MovieDetail />} />
                            <Route path="/carrito" element={<Cart />} />
                        </Routes>
                    </div>
                </Router>
            </CartProvider>
        </KeycloakProvider>
    );
}

export default App;
