import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faTimes,
    faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useKeycloak } from "@/hooks/useKeycloak.js";
import { peliculaService } from "@/services/peliculaService.js";


const genres = [
    "Acción", "Aventura", "Ciencia Ficción", "Comedia", "Drama",
    "Terror", "Thriller", "Romance", "Documentales", "Animación",
];

const ageRatings = ["G", "PG", "PG-13", "R", "NC-17"];
const formats = [
    "DVD", "Blu-ray", "Blu-ray 4K", "DVD + Digital",
    "Blu-ray + Digital", "Blu-ray 4K + Digital",
];

const conditions = [
    "Nuevo", "Usado - Como nuevo", "Usado - Bueno", "Usado - Aceptable",
];


export default function MovieForm({ pelicula, onSave, onClose }) {

    const [formData, setFormData] = useState({
        titulo: "",
        fechaSalida: "",
        precio: "",
        stock: "",

        director: "",
        actores: "",
        generosDetalle: [],

        imagenAmpliada: "",
        condicion: "",
        sinopsis: "",
        formato: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { keycloak } = useKeycloak();

    useEffect(() => {

        if (!pelicula) return;

        console.log("Condición recibida:", pelicula.condicion);

        setFormData({
            titulo: pelicula.titulo || "",
            fechaSalida: pelicula.fechaSalida || "",
            precio: pelicula.precio || "",
            stock: pelicula.stock ?? "",
            imagenAmpliada: pelicula.imagenAmpliada || "",

            director: pelicula.directoresDetalle
                ? pelicula.directoresDetalle.map(d => d.nombre).join(", ")
                : "",

            actores: pelicula.actoresDetalle
                ? pelicula.actoresDetalle.map(a => a.nombre).join(", ")
                : "",

            generosDetalle:
                pelicula.generosDetalle?.length
                    ? [pelicula.generosDetalle[0]]
                    : [],

            condicion: pelicula.condicion || "",
            sinopsis: pelicula.sinopsis || "",
            formato: pelicula.formato || ""
        });

    }, [pelicula]);

    useEffect(() => {

        const cargarDatos = async () => {

            try {

                const [listaActores, listaDirectores, listaGeneros] =
                    await Promise.all([
                        peliculaService.obtenerActores(),
                        peliculaService.obtenerDirectores(),
                        peliculaService.obtenerGeneros()
                    ]);

                setActores(listaActores);
                setDirectores(listaDirectores);
                setGeneros(listaGeneros);

            } catch (error) {
                console.error("Error al cargar actores, directores y géneros:", error);
            }

        };

        cargarDatos();

    }, []);

    const [actores, setActores] = useState([]);
    const [directores, setDirectores] = useState([]);
    const [generos, setGeneros] = useState([]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.titulo.trim())
            newErrors.titulo = "El título es obligatorio";

        if (!formData.fechaSalida)
            newErrors.fechaSalida = "La fecha de estreno es obligatoria";

        if (
            !formData.precio ||
            isNaN(Number(formData.precio)) ||
            Number(formData.precio) <= 0
        ) {
            newErrors.precio = "El precio debe ser válido y mayor a 0";
        }

        if (
            formData.stock === "" ||
            isNaN(Number(formData.stock)) ||
            Number(formData.stock) < 0
        ) {
            newErrors.stock = "El stock debe ser mayor o igual a 0";
        }

        if (!formData.director.trim()) {
            newErrors.director = "Debe ingresar al menos un director";
        }

        if (!formData.actores.trim()) {
            newErrors.actores = "Debe ingresar al menos un actor";
        }

        if (formData.generosDetalle.length === 0) {
            newErrors.genero = "Debe seleccionar un género";
        }

        if (!formData.imagenAmpliada.trim()) {
            newErrors.imagenAmpliada = "La URL de la imagen es obligatoria";
        }

        if (!formData.sinopsis.trim()) {
            newErrors.sinopsis = "La sinopsis es obligatoria";
        }

        if (!formData.formato) {
            newErrors.formato = "El formato es obligatorio";
        }

        if (!formData.condicion) {
            newErrors.condicion = "La condición es obligatoria";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Mapear los datos del formulario al DTO del backend
            const movieData = {
                titulo: formData.titulo.trim(),
                fechaSalida: formData.fechaSalida,
                precio: Number(formData.precio),
                stock: Number(formData.stock),

                condicion: formData.condicion,
                formato: formData.formato,
                sinopsis: formData.sinopsis.trim(),
                imagenAmpliada: formData.imagenAmpliada.trim(),

                actoresIds: formData.actoresDetalle.map(actor => actor.actorId),
                directoresIds: formData.directoresDetalle.map(director => director.directorId),
                generosIds: formData.generosDetalle.map(genero => genero.generoId)
            };

            let peliculaGuardada;

            if (pelicula?.peliculaId) {

                peliculaGuardada = await peliculaService.editar(
                    pelicula.peliculaId,
                    movieData
                );

            } else {

                peliculaGuardada = await peliculaService.crear(movieData);

            }

            onSave(peliculaGuardada);

        } catch (error) {
            console.error('Error al guardar película:', error);

            setErrors({
                submit: 'Error al guardar la película. Por favor, intenta nuevamente.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Vista previa */}
                    <div className="card bg-base-200 shadow-md">
                        <div className="card-body">
                            <h2 className="card-title flex items-center gap-2">
                                <FontAwesomeIcon icon={faUpload} className="text-primary" />
                                Vista Previa
                            </h2>

                            <div className="aspect-[3/4] bg-base-300 rounded-lg overflow-hidden flex items-center justify-center">
                                {formData.imagenAmpliada ? (
                                    <img
                                        src={formData.imagenAmpliada}
                                        alt="Vista previa"
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-base-content/50">Sin imagen</span>
                                )}
                            </div>

                            <label className="form-control w-full mt-4">
                                <span className="label-text">URL de la imagen *</span>
                                <input
                                    type="text"
                                    className={`input input-bordered w-full ${errors.imagenAmpliada ? "input-error" : ""
                                        }`}
                                    placeholder="https://..."
                                    value={formData.imagenAmpliada}
                                    onChange={(e) => handleInputChange("imagenAmpliada", e.target.value)}
                                />
                                {errors.imagenAmpliada && (
                                    <p className="text-error text-sm">{errors.imagenAmpliada}</p>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Formulario principal */}
                    <div className="card bg-base-200 shadow-md lg:col-span-2">
                        <div className="card-body space-y-4">
                            <h2 className="card-title">Información de la Película</h2>

                            {errors.submit && (
                                <div className="alert alert-error">
                                    {errors.submit}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text">Título *</span>
                                    <input
                                        type="text"
                                        className={`input input-bordered ${errors.titulo ? "input-error" : ""
                                            }`}
                                        value={formData.titulo}
                                        onChange={(e) => handleInputChange("titulo", e.target.value)}
                                    />
                                    {errors.titulo && (
                                        <p className="text-error text-sm">{errors.titulo}</p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Fecha de estreno *</span>
                                    <input
                                        type="date"
                                        className={`input input-bordered ${errors.fechaSalida ? "input-error" : ""
                                            }`}
                                        value={formData.fechaSalida}
                                        onChange={(e) => handleInputChange("fechaSalida", e.target.value)}
                                    />
                                    {errors.fechaSalida && (
                                        <p className="text-error text-sm">{errors.fechaSalida}</p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Precio ($) *</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className={`input input-bordered ${errors.precio ? "input-error" : ""
                                            }`}
                                        value={formData.precio}
                                        onChange={(e) => handleInputChange("precio", e.target.value)}
                                    />
                                    {errors.precio && (
                                        <p className="text-error text-sm">{errors.precio}</p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Stock disponible *</span>

                                    <input
                                        type="number"
                                        min="0"
                                        className={`input input-bordered ${errors.stock ? "input-error" : ""
                                            }`}
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange("stock", e.target.value)}
                                    />

                                    {errors.stock && (
                                        <p className="text-error text-sm">
                                            {errors.stock}
                                        </p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Género *</span>

                                    <select
                                        className={`select select-bordered ${errors.genero ? "select-error" : ""
                                            }`}
                                        value={formData.generosDetalle[0]?.generoId || ""}
                                        onChange={(e) => {
                                            const generoSeleccionado = generos.find(
                                                (g) => g.generoId === Number(e.target.value)
                                            );

                                            handleInputChange(
                                                "generosDetalle",
                                                generoSeleccionado ? [generoSeleccionado] : []
                                            );
                                        }}
                                    >
                                        <option value="">Seleccionar género</option>

                                        {generos.map((genero) => (
                                            <option
                                                key={genero.generoId}
                                                value={genero.generoId}
                                            >
                                                {genero.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.genero && (
                                        <p className="text-error text-sm">{errors.genero}</p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Formato *</span>
                                    <select
                                        className={`select select-bordered ${errors.formato ? "select-error" : ""
                                            }`}
                                        value={formData.formato}
                                        onChange={(e) => handleInputChange("formato", e.target.value)}
                                    >
                                        <option value="">Seleccionar formato</option>
                                        {formats.map((f) => (
                                            <option key={f}>{f}</option>
                                        ))}
                                    </select>
                                    {errors.formato && (
                                        <p className="text-error text-sm">{errors.formato}</p>
                                    )}
                                </label>

                                <label className="form-control">
                                    <span className="label-text">Condición *</span>
                                    <select
                                        className={`select select-bordered ${errors.condicion ? "select-error" : ""
                                            }`}
                                        value={formData.condicion}
                                        onChange={(e) => handleInputChange("condicion", e.target.value)}
                                    >
                                        <option value="">Seleccionar condición</option>
                                        {conditions.map((c) => (
                                            <option key={c}>{c}</option>
                                        ))}
                                    </select>
                                    {errors.condicion && (
                                        <p className="text-error text-sm">{errors.condicion}</p>
                                    )}
                                </label>
                            </div>

                            <label className="form-control">
                                <span className="label-text">Director(es) *</span>

                                <input
                                    type="text"
                                    className={`input input-bordered ${errors.director ? "input-error" : ""
                                        }`}
                                    placeholder="Ej: Martin Scorsese, Francis Ford Coppola"
                                    value={formData.director}
                                    onChange={(e) =>
                                        handleInputChange("director", e.target.value)
                                    }
                                />

                                <label className="label">
                                    <span className="label-text-alt">
                                        Si hay más de un director, separalos con comas.
                                    </span>
                                </label>

                                {errors.director && (
                                    <p className="text-error text-sm">{errors.director}</p>
                                )}
                            </label>

                            <label className="form-control">
                                <span className="label-text">Actores principales *</span>

                                <textarea
                                    rows={3}
                                    className={`textarea textarea-bordered ${errors.actores ? "textarea-error" : ""
                                        }`}
                                    placeholder="Ej: Leonardo DiCaprio, Samuel L. Jackson, Morgan Freeman"
                                    value={formData.actores}
                                    onChange={(e) =>
                                        handleInputChange("actores", e.target.value)
                                    }
                                />

                                <label className="label">
                                    <span className="label-text-alt">
                                        Separá los actores con comas.
                                    </span>
                                </label>

                                {errors.actores && (
                                    <p className="text-error text-sm">{errors.actores}</p>
                                )}
                            </label>

                            <label className="form-control">
                                <span className="label-text">Sinopsis *</span>
                                <textarea
                                    className={`textarea textarea-bordered resize-none ${errors.sinopsis ? "textarea-error" : ""
                                        }`}
                                    rows={4}
                                    value={formData.sinopsis}
                                    onChange={(e) => handleInputChange("sinopsis", e.target.value)}
                                />
                                {errors.sinopsis && (
                                    <p className="text-error text-sm">{errors.sinopsis}</p>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-4 border-t border-base-300">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                        )}
                        {loading
                            ? 'Guardando...'
                            : pelicula
                                ? 'Actualizar Película'
                                : 'Guardar Película'
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}