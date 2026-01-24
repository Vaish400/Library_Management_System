import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  requestOTP: (email) => api.post('/auth/request-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  getCurrentUser: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users')
};

// Book APIs
export const bookAPI = {
  getAllBooks: (params) => api.get('/books', { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  addBook: (formData) => {
    // Don't set Content-Type - axios will set it automatically with boundary for FormData
    return api.post('/books', formData);
  },
  updateBook: (id, formData) => {
    // Don't set Content-Type - axios will set it automatically with boundary for FormData
    return api.put(`/books/${id}`, formData);
  },
  deleteBook: (id) => api.delete(`/books/${id}`),
  // Read/open the uploaded file in a new tab (public static /uploads)
  openBookFile: (fileUrl) => {
    const url = `${API_URL.replace('/api', '')}${fileUrl}`;
    window.open(url, '_blank');
  },
  // Download as attachment via authenticated endpoint (uses JWT header)
  downloadBookById: async (bookId, fallbackFileName = `book-${bookId}`) => {
    const response = await api.get(`/books/${bookId}/download`, {
      responseType: 'blob'
    });

    const blob = new Blob([response.data], { type: response.data?.type || 'application/octet-stream' });

    // Try to read filename from Content-Disposition header
    const disposition = response.headers?.['content-disposition'] || response.headers?.get?.('content-disposition');
    let fileName = fallbackFileName;
    if (disposition) {
      // filename*=UTF-8''... OR filename="..."
      const utf8Match = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
      const plainMatch = disposition.match(/filename\s*=\s*\"?([^\";]+)\"?/i);
      if (utf8Match?.[1]) fileName = decodeURIComponent(utf8Match[1]);
      else if (plainMatch?.[1]) fileName = plainMatch[1];
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};

// Issue APIs
export const issueAPI = {
  issueBook: (bookId) => api.post('/issues/issue', { bookId }),
  returnBook: (issueId) => api.post('/issues/return', { issueId }),
  getMyIssuedBooks: () => api.get('/issues/my-books'),
  getAllIssuedBooks: () => api.get('/issues/all')
};

// Rating APIs
export const ratingAPI = {
  addRating: (bookId, rating) => api.post('/ratings', { bookId, rating }),
  getUserRating: (bookId) => api.get(`/ratings/book/${bookId}/user`),
  getBookRatings: (bookId) => api.get(`/ratings/book/${bookId}`)
};

// Comment APIs
export const commentAPI = {
  addComment: (bookId, comment) => api.post('/comments', { bookId, comment }),
  getBookComments: (bookId) => api.get(`/comments/book/${bookId}`),
  updateComment: (id, comment) => api.put(`/comments/${id}`, { comment }),
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

export default api;
