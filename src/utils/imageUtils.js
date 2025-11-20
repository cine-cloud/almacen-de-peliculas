import fallbackImage from '@/assets/movie-4.jpg';

/**
 * Valida si una URL es válida para una imagen
 * @param {string} url - URL a validar
 * @returns {boolean} - true si la URL es válida, false en caso contrario
 */
export const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return false;
    }

    // Verificar que sea una URL válida
    try {
        const urlObj = new URL(url);
        // Verificar que el protocolo sea http o https
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }
    } catch (e) {
        // Si no es una URL absoluta, podría ser una ruta relativa válida
        // Permitir rutas que empiecen con / o sean rutas relativas
        if (!url.startsWith('/') && !url.startsWith('./') && !url.startsWith('../')) {
            return false;
        }
    }

    // Verificar extensiones de imagen comunes
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const lowerUrl = url.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => lowerUrl.includes(ext));

    // Si no tiene extensión, podría ser una URL de API que devuelve imágenes
    // En ese caso, asumimos que es válida si pasó la validación de URL
    return hasImageExtension || url.includes('http');
};

/**
 * Normaliza una URL de imagen, asegurándose de que sea válida
 * @param {string} url - URL a normalizar
 * @returns {string} - URL normalizada o fallback si no es válida
 */
export const normalizeImageUrl = (url) => {
    if (!isValidImageUrl(url)) {
        return fallbackImage;
    }

    // Limpiar espacios en blanco
    return url.trim();
};

/**
 * Obtiene la URL de la imagen con fallback automático
 * @param {string} imageUrl - URL de la imagen
 * @param {string} customFallback - URL de fallback personalizada (opcional)
 * @returns {string} - URL de la imagen o fallback
 */
export const getImageUrl = (imageUrl, customFallback = null) => {
    const fallback = customFallback || fallbackImage;
    return normalizeImageUrl(imageUrl) || fallback;
};

