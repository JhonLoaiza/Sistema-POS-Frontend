/**
 * Configuración de API URL para el frontend
 * Usa variables de entorno para determinar la URL del backend
 */

/**
 * Obtiene la URL del API según el entorno
 * @returns {string} URL del backend API
 */
const getApiUrl = () => {
  // En producción, usar variable de entorno
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En desarrollo, usar localhost
  return 'http://localhost:5000/api';
};

/**
 * URL base del API
 * Usar esta constante en todos los services
 */
export const API_URL = getApiUrl();

/**
 * URL del servidor (sin /api)
 * Útil para acceso a recursos estáticos
 */
export const SERVER_URL = API_URL.replace('/api', '');
