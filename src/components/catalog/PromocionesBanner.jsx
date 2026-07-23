import React, { useEffect, useState } from "react";
import { Tag, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { descuentoService } from "@/services/descuentoService";

export default function PromocionesBanner() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchPromociones = async () => {
      try {
        const data = await descuentoService.listarActivos();
        setPromociones(data);
      } catch (error) {
        console.error("Error al cargar promociones en el banner:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromociones();
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (promociones.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [promociones, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? promociones.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === promociones.length - 1 ? 0 : prev + 1));
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return "";
    const parts = fechaString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaString;
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="bg-secondary text-secondary-content w-full py-3 px-6 flex justify-center items-center gap-2">
        <span className="loading loading-spinner loading-xs text-primary"></span>
        <span className="text-sm font-medium opacity-80">Cargando promociones...</span>
      </div>
    );
  }

  if (promociones.length === 0) {
    return null; // Si no hay promociones activas, no se muestra el banner
  }

  const currentPromo = promociones[currentIndex];
  const isCopied = copiedCode === currentPromo.codigo;

  return (
    <section 
      className="bg-secondary text-secondary-content w-full shadow-md select-none border-b border-white/5 relative animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between min-h-[52px]">
        
        {/* Etiqueta PROMOCIONES */}
        <div className="flex items-center gap-2 flex-shrink-0 text-white font-bold uppercase tracking-wider text-sm select-none">
          <Tag className="w-5 h-5 text-primary rotate-90" />
          <span className="hidden sm:inline">Promociones</span>
        </div>

        {/* Carousel Content */}
        <div className="flex items-center justify-center flex-grow px-4 overflow-hidden">
          {promociones.length > 1 && (
            <button
              onClick={handlePrev}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer mr-2 flex-shrink-0"
              aria-label="Promoción anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Active Promo Capsule */}
          <div className="flex items-center gap-3 bg-black/20 border border-white/10 hover:border-primary/30 hover:bg-black/35 transition-all duration-300 rounded-full px-5 py-1.5 text-sm shadow-sm max-w-full overflow-hidden">
            {/* Descuento Monto */}
            <span className="text-primary font-extrabold tracking-tight whitespace-nowrap">
              {Math.round(currentPromo.monto)}% OFF
            </span>

            {/* Descripcion */}
            <span className="text-white/95 font-medium truncate max-w-[200px] sm:max-w-md">
              {currentPromo.descripcion}
            </span>

            {/* Código Copiable */}
            <button
              onClick={() => handleCopy(currentPromo.codigo)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-xs uppercase tracking-wide transition-all duration-200 cursor-pointer flex-shrink-0 ${
                isCopied
                  ? "bg-success text-success-content"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
              }`}
              title="Click para copiar el código"
              aria-label={`Copiar código de descuento ${currentPromo.codigo}`}
            >
              <span>{currentPromo.codigo}</span>
              {isCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-80 hover:opacity-100" />
              )}
            </button>

            {/* Fecha Limite */}
            <span className="text-white/60 text-xs font-normal whitespace-nowrap hidden md:inline">
              Válido hasta {formatFecha(currentPromo.fechaHasta)}
            </span>
          </div>

          {promociones.length > 1 && (
            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer ml-2 flex-shrink-0"
              aria-label="Siguiente promoción"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Indicators (dots) shown on desktop if multiple promos */}
        {promociones.length > 1 && (
          <div className="hidden lg:flex items-center gap-1.5 ml-4 flex-shrink-0">
            {promociones.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Ir a promoción ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
