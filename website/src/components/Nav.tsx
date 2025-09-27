import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path
  
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/developers', label: 'Developers' },
  ]
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="container-custom" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 font-semibold text-xl text-gray-900 hover:text-brand-600 transition-colors"
            aria-label="Ticket to Code homepage"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5H18.5A1.5 1.5 0 0 1 20 7.5v2a2 2 0 0 0-2 2 2 2 0 0 0 2 2v2a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 15.5v-2a2 2 0 0 0 2-2 2 2 0 0 0-2-2v-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M10 9.5 8 12l2 2.5M14 9.5 16 12l-2 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Ticket to Code</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`font-medium transition-colors hover:text-brand-600 ${
                  isActive(path) 
                    ? 'text-brand-600 border-b-2 border-brand-600 pb-1' 
                    : 'text-gray-700'
                }`}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
          
          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="https://github.com/your-org/ticket-to-code"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label="Get started with Ticket to Code on GitHub"
            >
              Get Started
            </a>
          </div>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-brand-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`font-medium transition-colors hover:text-brand-600 ${
                    isActive(path) ? 'text-brand-600' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(path) ? 'page' : undefined}
                >
                  {label}
                </Link>
              ))}
              <a
                href="https://github.com/your-org/ticket-to-code"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}