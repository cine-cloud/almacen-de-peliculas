import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            {/* Input de búsqueda */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                    type="text"
                    placeholder="Buscar películas..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Dropdown filtros */}
            <details className="dropdown">
                <summary className="btn m-1">Filtros</summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li>Comedia</li>
                    <li>Acción</li>
                    <li>Drama</li>
                    <li>Terror</li>
                </ul>
            </details>
        </div>
    );
}
