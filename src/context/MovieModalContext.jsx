import { createContext, useContext, useState } from "react";

const MovieModalContext = createContext();

export function MovieModalProvider({ children }) {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <MovieModalContext.Provider
            value={{
                isModalOpen,
                openModal,
                closeModal
            }}
        >
            {children}
        </MovieModalContext.Provider>
    );
}

export function useMovieModal() {
    return useContext(MovieModalContext);
}