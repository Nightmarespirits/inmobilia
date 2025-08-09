import axios from 'axios';

// La URL base del API Gateway debe estar en una variable de entorno
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // En un futuro, el token se obtendrá del estado de autenticación (ej. localStorage, context)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Manejador de errores de API centralizado
 * @param error - El objeto de error de Axios
 * @returns - Un objeto de error estandarizado
 */
const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Ocurrió un error inesperado.',
      statusCode: error.response?.status,
    };
  } else {
    console.error('Unexpected Error:', error);
    return { success: false, message: 'Ocurrió un error inesperado.' };
  }
};

// --- Endpoints de Propiedades ---

export const getProperties = async (params = {}) => {
  try {
    const response = await apiClient.get('/properties', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getPropertyById = async (id: string) => {
  try {
    const response = await apiClient.get(`/properties/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

// Aquí se añadirían más funciones para otros servicios (auth, users, search, etc.)

export default apiClient;
