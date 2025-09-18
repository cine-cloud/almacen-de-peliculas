import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CatalogoPelicula from './components/CatalogoPelicula.jsx';
import MovieDetail from './components/MovieDetail.jsx';

function App() {
    return (
        <Router>
            <div className="bg-base-100 text-base-content min-h-screen">
                <Routes>
                    <Route path="/" element={<CatalogoPelicula />} />
                    <Route path="/pelicula/:id" element={<MovieDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
