import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MovieCatalog from './components/MovieCatalog.jsx';
import MovieDetail from './components/MovieDetail.jsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

library.add(faShareNodes);
function App() {
    return (
        <Router>
            <div className="bg-base-100 text-base-content min-h-screen">
                <Routes>
                    <Route path="/" element={<MovieCatalog />} />
                    <Route path="/pelicula/:id" element={<MovieDetail />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
