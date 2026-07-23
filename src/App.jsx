import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import KeycloakProvider from "./hooks/KeycloakProvider.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import MovieDetail from "./components/catalog/MovieDetail.jsx";
import Header from "./components/shared/layout/Header.jsx";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { CartProvider } from "@/hooks/useCart.jsx";
import Cart from "./components/cart/Cart.jsx";
import HistorialCompras from "./pages/HistorialCompras.jsx";
import { MovieModalProvider } from "./context/MovieModalContext";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import GestionDescuentos from "@/pages/GestionDescuentos.jsx";

library.add(faShareNodes);

function App() {
  return (
    <KeycloakProvider>
      <CartProvider>
        <MovieModalProvider>
          <Router>
            <Header/>
            <div className="bg-base-100 text-base-content min-h-screen">
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/pelicula/:id" element={<MovieDetail />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/historial" element={<HistorialCompras />} />
                <Route 
                  path="/admin/descuentos" 
                  element={
                    <ProtectedRoute role="admin">
                      <GestionDescuentos />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </MovieModalProvider>
    </CartProvider>
    </KeycloakProvider >
  );
}

export default App;
