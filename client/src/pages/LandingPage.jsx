import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slider images (using placeholder images - replace with your own)
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80',
      title: 'Discover Your Next Adventure',
      subtitle: 'Explore thousands of books at your fingertips'
    },
    {
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80',
      title: 'Knowledge Awaits',
      subtitle: 'From classics to modern bestsellers'
    },
    {
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80',
      title: 'Read Anywhere, Anytime',
      subtitle: 'Digital library access 24/7'
    },
    {
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1920&q=80',
      title: 'Join Our Community',
      subtitle: 'Connect with fellow book lovers'
    }
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const features = [
    {
      icon: '📚',
      title: 'Vast Collection',
      description: 'Access thousands of books across multiple genres and categories'
    },
    {
      icon: '🔍',
      title: 'Easy Search',
      description: 'Find your next read with our powerful search and filter system'
    },
    {
      icon: '📖',
      title: 'Digital Reading',
      description: 'Read books online or download for offline access'
    },
    {
      icon: '⭐',
      title: 'Ratings & Reviews',
      description: 'Share your thoughts and discover highly-rated books'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your library from any device, anywhere'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Get notified about new arrivals and due dates'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Books Available' },
    { number: '5,000+', label: 'Active Members' },
    { number: '50+', label: 'Categories' },
    { number: '24/7', label: 'Access' }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-icon">📚</span>
          <span className="nav-title">LibraryMS</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
          <Link to="/register" className="nav-btn nav-btn-primary">Get Started</Link>
        </div>
        <button className="mobile-menu-btn" onClick={() => document.querySelector('.nav-links').classList.toggle('active')}>
          ☰
        </button>
      </nav>

      {/* Hero Section with Slider */}
      <section className="hero-section">
        <div className="slider">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay"></div>
              <div className="slide-content">
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-subtitle">{slide.subtitle}</p>
                <div className="hero-buttons">
                  <Link to="/register" className="hero-btn hero-btn-primary">
                    Start Reading Free
                  </Link>
                  <Link to="/login" className="hero-btn hero-btn-secondary">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <button className="slider-btn slider-btn-prev" onClick={prevSlide}>
            ‹
          </button>
          <button className="slider-btn slider-btn-next" onClick={nextSlide}>
            ›
          </button>

          {/* Slider Dots */}
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Our Library?</h2>
            <p className="section-subtitle">
              Experience the future of library management with our modern features
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="section-container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">About Our Library</h2>
              <p>
                Welcome to the Library Management System, your gateway to a world of knowledge 
                and imagination. Our digital platform brings the traditional library experience 
                into the modern age, making it easier than ever to discover, borrow, and enjoy books.
              </p>
              <p>
                Whether you're a student looking for academic resources, a professional seeking 
                industry insights, or a casual reader exploring new genres, our extensive collection 
                has something for everyone.
              </p>
              <ul className="about-features">
                <li>✓ Easy book borrowing and returns</li>
                <li>✓ Digital and physical book options</li>
                <li>✓ Personalized recommendations</li>
                <li>✓ Community reviews and ratings</li>
              </ul>
              <Link to="/register" className="about-btn">Join Now - It's Free!</Link>
            </div>
            <div className="about-image">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&q=80" 
                alt="Library interior"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Reading Journey?</h2>
          <p>Join thousands of readers who have discovered their next favorite book with us.</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn cta-btn-primary">Create Free Account</Link>
            <Link to="/login" className="cta-btn cta-btn-secondary">Already a Member? Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-icon">📚</span>
            <span className="footer-title">LibraryMS</span>
            <p className="footer-description">
              Your digital gateway to endless knowledge and adventures through books.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <a href="#features">Features</a>
              <a href="#about">About Us</a>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#!">Help Center</a>
              <a href="#!">FAQs</a>
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <p>📧 support@libraryms.com</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>📍 123 Library Street</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
