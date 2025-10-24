import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KeycloakProvider from './components/KeycloakProvider.jsx';
import MovieCatalog from './components/catalog/MovieCatalog.jsx';
import MovieDetail from './components/catalog/MovieDetail.jsx';
import Header from './components/shared/layout/Header.jsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

library.add(faShareNodes);

function App() {
    return (
        <KeycloakProvider>
            <Router>
                <Header />
                <div className="bg-base-100 text-base-content min-h-screen">
                    <Routes>
                        <Route path="/" element={<MovieCatalog />} />
                        <Route path="/pelicula/:id" element={<MovieDetail />} />
                    </Routes>
                </div>
            </Router>
        </KeycloakProvider>
    );
}

export default App;
