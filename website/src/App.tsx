import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Features from './pages/Features'
import Developers from './pages/Developers'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <Nav />
      
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

// 404 Page Component
function NotFound() {
  return (
    <div className="section-padding">
      <div className="container-custom text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <a 
          href="/" 
          className="btn-primary inline-block"
          aria-label="Return to homepage"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}

export default App