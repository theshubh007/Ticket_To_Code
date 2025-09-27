import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-[80vh] flex items-center">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance">
            Ticket to Code:
            <span className="text-brand-600 block">tickets → code</span>
            <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-600 block mt-4">
              without leaving your IDE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto text-balance">
            Streamline your development workflow with AI-powered JIRA integration, 
            safe code diffs, and seamless Git integration - all within VS Code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/features" className="btn-primary text-lg px-8 py-4">
              See Features
            </Link>
            <Link to="/developers" className="btn-secondary text-lg px-8 py-4">
              Meet the Developers
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="bg-white rounded-lg shadow-lg p-2 max-w-2xl">
              <div className="bg-gray-900 rounded-md p-8 text-center">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-white mb-2">VS Code Extension</h3>
                <p className="text-gray-300 mb-4">Seamlessly integrated into your development environment</p>
                <div className="flex justify-center space-x-4 text-sm text-gray-400">
                  <span>• JIRA Integration</span>
                  <span>• AI Assistant</span>
                  <span>• Code Diffs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section 
        kicker="Simple Workflow"
        title="How It Works"
        subtitle="Transform your development process in three simple steps"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              step: '1',
              icon: '🎫',
              title: 'Browse Tickets',
              description: 'Connect to JIRA and browse your tickets directly in VS Code sidebar. No more context switching between tools.'
            },
            {
              step: '2',
              icon: '🤖',
              title: 'Chat with AI',
              description: 'Get code suggestions, explanations, and implementation guidance from our AI assistant tailored to your ticket.'
            },
            {
              step: '3',
              icon: '✅',
              title: 'Apply Safely',
              description: 'Preview changes with side-by-side diffs before applying. Auto-create Git branches and link code to tickets.'
            }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-200 transition-colors">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Social Proof */}
      <Section className="bg-white">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers who have streamlined their workflow with Ticket to Code
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {[
            { name: 'VS Code', icon: '💻', description: 'Integrated' },
            { name: 'GitHub', icon: '🐙', description: 'Connected' },
            { name: 'JIRA', icon: '🎫', description: 'Synced' },
            { name: 'AI', icon: '🤖', description: 'Powered' }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white rounded-lg p-6 h-20 flex flex-col items-center justify-center shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-semibold text-gray-700 text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 font-medium">
            "Finally, a tool that bridges the gap between project management and actual coding."
          </p>
        </div>
      </Section>

      {/* Performance & Accessibility */}
      <Section 
        className="bg-gray-50"
        title="Built for Performance & Accessibility"
        subtitle="Fast, reliable, and inclusive by design"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Optimized for speed with minimal resource usage'
            },
            {
              icon: '♿',
              title: 'Accessible',
              description: 'WCAG 2.1 AA compliant with full keyboard navigation'
            },
            {
              icon: '📱',
              title: 'Responsive',
              description: 'Works seamlessly across all screen sizes'
            },
            {
              icon: '🔒',
              title: 'Secure',
              description: 'Your credentials are encrypted and stored safely'
            }
          ].map((feature, index) => (
            <div key={index} className="card p-6 text-center">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-brand-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Install Ticket to Code today and experience the future of development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://marketplace.visualstudio.com/items?itemName=your-publisher.ticket-to-code"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              Install Extension
            </a>
            <a 
              href="https://github.com/your-org/ticket-to-code"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-brand-600 font-medium px-8 py-4 rounded-lg transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}