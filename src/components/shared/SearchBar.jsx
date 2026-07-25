import { Search } from "lucide-react";

export default function SearchBar({ valor, onChange, onBuscar }) {
    return (
        <div className="flex items-center justify-center gap-3 w-full max-w-4xl mx-auto mt-5 mb-6">

            {/* Input */}
            <div className="relative flex-1">

                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                />

                <input
                    type="text"
                    value={valor}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onBuscar();
                        }
                    }}
                    placeholder="Buscar por Título o Género"
                    className="
                        w-full
                        h-12
                        pl-12
                        pr-4
                        text-base
                        bg-white
                        border
                        border-gray-300
                        rounded-xl
                        shadow-sm
                        placeholder:text-gray-400
                        placeholder:text-base
                        focus:outline-none
                        focus:ring-2
                        focus:ring-primary
                        focus:border-primary
                    "
                />
            </div>

            {/* Botón */}
            <button
                onClick={onBuscar}
                className="
                    btn
                    btn-primary
                    h-12
                    px-6
                    rounded-xl
                    text-sm
                    font-semibold
                    flex
                    items-center
                    gap-2
                "
            >
                <Search size={16} />
                Buscar
            </button>

        </div>
    );
}