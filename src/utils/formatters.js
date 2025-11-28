/**
 * Creamos el formateador una sola vez,
 * es más eficiente que crearlo en cada render.
 */
const currencyFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0, // CLP no usa decimales
    maximumFractionDigits: 0,
});

/**
 * Formatea un número al formato de moneda CLP (ej. $1.500)
 * @param {number} value El número a formatear
 * @returns {string} El número formateado como moneda
 */
export const formatCurrencyCLP = (value) => {
    // Manejamos el caso de que el valor sea null o undefined
    if (value == null) return ''; 
    
    return currencyFormatter.format(value);
};