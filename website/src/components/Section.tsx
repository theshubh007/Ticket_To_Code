import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  kicker?: string
  title?: string
  subtitle?: string
  className?: string
  id?: string
}

export default function Section({ 
  children, 
  kicker, 
  title, 
  subtitle, 
  className = '', 
  id 
}: SectionProps) {
  return (
    <section id={id} className={`section-padding ${className}`}>
      <div className="container-custom">
        {(kicker || title || subtitle) && (
          <div className="text-center mb-16">
            {kicker && (
              <p className="text-brand-600 font-semibold text-sm uppercase tracking-wide mb-4">
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 text-balance">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}