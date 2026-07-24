import { useRef, useState } from "react";
import { useMovieModal } from "@/context/MovieModalContext";
import MovieCatalog from "@/components/catalog/MovieCatalog";
import MovieForm from "@/components/catalog/MovieForm";
import PromocionesBanner from "@/components/catalog/PromocionesBanner";
import { peliculaService } from "@/services/peliculaService";

export default function CatalogPage() {

    const { isModalOpen, openModal, closeModal } = useMovieModal();
    const catalogRef = useRef(null);
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    const handleEditar = async (pelicula) => {
        try {
            const peliculaCompleta = await peliculaService.obtenerDetalle(pelicula.peliculaId);
            setPeliculaSeleccionada(peliculaCompleta);
            openModal();
        } catch (error) {
            console.error("Error al obtener detalle de la película", error);
        }
    };

    const handleCloseModal = () => { setPeliculaSeleccionada(null); closeModal(); };

    const handleSaveSuccess = (movieData, isEdition) => {
        const msg = isEdition 
            ? "¡Película actualizada correctamente!" 
            : "¡Película creada correctamente!";
        setToastMessage(msg);
        catalogRef.current?.reload();
        closeModal();
        setTimeout(() => {
            setToastMessage("");
        }, 4000);
    };

    return (
        <>
            <PromocionesBanner />

            {/* Alerta flotante de éxito (Toast) */}
            {toastMessage && (
                <div className="fixed top-20 right-6 z-50 animate-bounce">
                    <div className="alert alert-success text-white shadow-2xl font-bold px-6 py-4 rounded-xl flex items-center gap-3">
                        <span className="text-xl">✓</span>
                        <span className="text-base">{toastMessage}</span>
                    </div>
                </div>
            )}

            <MovieCatalog
                ref={catalogRef}
                onEditar={handleEditar}
            />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative">

                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-primary text-lg w-8 h-8 flex items-center justify-center"
                            onClick={handleCloseModal}
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-4 text-primary">
                            {peliculaSeleccionada
                                ? "Editar Película"
                                : "Agregar Nueva Película"}
                        </h2>

                        <MovieForm
                            pelicula={peliculaSeleccionada}
                            onSave={(movieData) => handleSaveSuccess(movieData, !!peliculaSeleccionada)}
                            onClose={handleCloseModal}
                        />
                    </div>
                </div>
            )}
        </>
    );
}