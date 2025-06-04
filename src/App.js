import React from 'react';

function App() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-dark" href="/">MyApp</a>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link text-secondary" href="/home">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary" href="/about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-secondary" href="/contact">Contact</a>
              </li>
            </ul>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container py-5">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="display-4 fw-bold text-dark mb-4">
                Welcome to Your Azure-App
              </h2>
              <p className="lead text-secondary mb-4 mx-auto" style={{maxWidth: '600px'}}>
                Build amazing experiences with React. This is a clean, modern starting point for your application.
              </p>
              <button className="btn btn-primary btn-lg px-4 py-2">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h3 className="display-5 fw-bold text-dark">Features</h3>
              <p className="lead text-secondary mt-3">Everything you need to build great applications</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <svg className="text-primary" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="card-title h5 fw-semibold text-dark mb-2">Fast Performance</h4>
                  <p className="card-text text-secondary">Optimized for speed and efficiency with modern React practices.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <svg className="text-success" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="card-title h5 fw-semibold text-dark mb-2">User Friendly</h4>
                  <p className="card-text text-secondary">Intuitive design that puts user experience first.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded mb-3" 
                       style={{width: '60px', height: '60px'}}>
                    <svg className="text-info" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="card-title h5 fw-semibold text-dark mb-2">Customizable</h4>
                  <p className="card-text text-secondary">Easily adaptable to fit your specific needs and requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-top">
        <div className="container py-4">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-secondary mb-0">&copy; 2025 MyApp. Built with React.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;