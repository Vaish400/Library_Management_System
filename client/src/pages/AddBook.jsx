import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookAPI } from '../services/api';
import './AddBook.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    quantity: '',
    language: 'English',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingBook, setLoadingBook] = useState(false);

  useEffect(() => {
    if (editId) {
      fetchBook();
    }
  }, [editId]);

  const fetchBook = async () => {
    setLoadingBook(true);
    try {
      const response = await bookAPI.getBookById(editId);
      const book = response.data.book;
      setFormData({
        title: book.title || '',
        author: book.author || '',
        quantity: book.quantity || '',
        language: book.language || 'English',
        description: book.description || ''
      });
      if (book.image_url) {
        const imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${book.image_url}`;
        setImagePreview(imageUrl);
      }
    } catch (error) {
      setError('Failed to load book details');
    } finally {
      setLoadingBook(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBookFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('description', formData.description || '');

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      if (bookFile) {
        formDataToSend.append('bookFile', bookFile);
      }

      if (editId) {
        await bookAPI.updateBook(editId, formDataToSend);
      } else {
        await bookAPI.addBook(formDataToSend);
      }

      navigate('/books');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) {
    return (
      <div className="add-book-loading">
        <div className="loading-spinner"></div>
        <p>Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="add-book-page">
      <div className="add-book-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              {editId ? '✏️ Edit Book' : '➕ Add New Book'}
            </h1>
            <p className="page-subtitle">
              {editId ? 'Update book information and details' : 'Add a new book to the library collection'}
            </p>
          </div>
          <button
            onClick={() => navigate('/books')}
            className="btn-back"
          >
            ← Back to Books
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-card">
          <form onSubmit={handleSubmit} className="add-book-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📖</span>
                  Book Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">✍️</span>
                  Author <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔢</span>
                  Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter quantity"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🌐</span>
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                rows="5"
                placeholder="Enter book description..."
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🖼️</span>
                  Book Cover Image
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="file-label">
                    <span className="file-icon">📤</span>
                    <span className="file-text">Choose Image</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="remove-image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📄</span>
                  Book PDF (recommended)
                </label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleBookFileChange}
                    className="file-input"
                    id="book-upload"
                  />
                  <label htmlFor="book-upload" className="file-label">
                    <span className="file-icon">📤</span>
                    <span className="file-text">Choose File</span>
                  </label>
                </div>
                {bookFile && (
                  <div className="file-info">
                    <span className="file-name">📎 {bookFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/books')}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span>
                    {editId ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {editId ? '✏️ Update Book' : '➕ Add Book'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBook;
