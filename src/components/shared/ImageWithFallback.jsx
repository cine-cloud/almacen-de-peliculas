import { useState, useEffect } from 'react';
import { isValidImageUrl } from '@/utils/imageUtils';
import fallbackImage from '@/assets/movie-4.jpg';

/**
 * Componente reutilizable para mostrar imágenes con manejo automático de errores
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS adicionales
 * @param {string} fallback - URL de imagen de respaldo personalizada (opcional)
 * @param {object} rest - Props adicionales para el elemento img
 */
const ImageWithFallback = ({ 
    src, 
    alt = '', 
    className = '', 
    fallback = null,
    ...rest 
}) => {
    const [imageSrc, setImageSrc] = useState(() => {
        // Validar la URL inicial
        if (isValidImageUrl(src)) {
            return src;
        }
        return fallback || fallbackImage;
    });

    const [hasError, setHasError] = useState(false);

    // Actualizar la imagen si cambia la prop src
    useEffect(() => {
        if (src && isValidImageUrl(src)) {
            setImageSrc(src);
            setHasError(false);
        } else if (!src) {
            setImageSrc(fallback || fallbackImage);
            setHasError(false);
        }
    }, [src, fallback]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc(fallback || fallbackImage);
        }
    };

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={handleError}
            loading="lazy"
            {...rest}
        />
    );
};

export default ImageWithFallback;

