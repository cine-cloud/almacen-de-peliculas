import { useRef } from "react";
import { useMovieModal } from "@/context/MovieModalContext";
import MovieCatalog from "@/components/catalog/MovieCatalog";
import MovieForm from "@/components/catalog/MovieForm";

export default function CatalogPage() {

    const { isModalOpen, closeModal } = useMovieModal();
    const catalogRef = useRef(null);

    return (
        <>
            <MovieCatalog ref={catalogRef} />

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="bg-base-100 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg relative">

                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-primary text-lg w-8 h-8 flex items-center justify-center"
                            onClick={closeModal}
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold mb-4 text-primary">
                            Agregar Nueva Película
                        </h2>

                        <MovieForm
                            onSave={(movieData) => {
                                console.log("Película guardada:", movieData);

                                catalogRef.current?.reload();

                                closeModal();
                            }}
                            onClose={closeModal}
                        />
                    </div>
                </div>
            )}
        </>
    );
}