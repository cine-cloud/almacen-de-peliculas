import { createContext, useContext, useState } from "react";

const MovieModalContext = createContext();

export function MovieModalProvider({ children }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);

    const openModal = (pelicula = null) => {
        setPeliculaSeleccionada(pelicula);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPeliculaSeleccionada(null);
    };

    return (
        <MovieModalContext.Provider
            value={{
                isModalOpen,
                peliculaSeleccionada,
                setPeliculaSeleccionada,
                openModal,
                closeModal
            }}
        >
            {children}
        </MovieModalContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMovieModal() {
    return useContext(MovieModalContext);
}