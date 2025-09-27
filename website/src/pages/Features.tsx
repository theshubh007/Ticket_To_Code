import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function Features() {
  const features = [
    // Workflow Features
    {
      category: 'Workflow',
      title: 'JIRA Integration',
      description: 'Browse and manage tickets directly in VS Code sidebar. No more switching between tools.',
      icon: '🎫'
    },
    {
      category: 'Workflow',
      title: 'Git Branch Automation',
      description: 'Automatically create and switch to feature branches based on ticket information.',
      icon: '🌿'
    },
    
    // Safety Features
    {
      category: 'Safety',
      title: 'Safe Diff Previews',
      description: 'Review AI-generated changes with side-by-side diffs before applying to your codebase.',
      icon: '🔍'
    },
    {
      category: 'Safety',
      title: 'Virtual Documents',
      description: 'Preview changes in virtual documents to ensure safety before committing to files.',
      icon: '📄'
    },
    
    // Productivity Features
    {
      category: 'Productivity',
      title: 'CodeLens Integration',
      description: 'Link code functions directly to tickets with inline CodeLens annotations.',
      icon: '📎'
    },
    {
      category: 'Productivity',
      title: 'Code Indexing',
      description: 'Intelligent workspace indexing for better context awareness and search.',
      icon: '🔎'
    },
    
    // Intelligence Features
    {
      category: 'Intelligence',
      title: 'AI Assistant',
      description: 'Chat with AI for code suggestions, explanations, and implementation guidance.',
      icon: '🤖'
    },
    {
      category: 'Intelligence',
      title: 'Context-Aware Suggestions',
      description: 'AI understands your ticket context and provides relevant code suggestions.',
      icon: '🧠'
    }
  ]

  const benefits = [
    {
      feature: 'Fewer Context Switches',
      value: 'Stay in VS Code instead of jumping between JIRA, browser, and IDE',
      impact: '40% faster development'
    },
    {
      feature: 'Safer Code Changes',
      value: 'Preview and review all AI suggestions before applying',
      impact: '60% fewer bugs'
    },
    {
      feature: 'Better Traceability',
      value: 'Direct links between code and tickets for better project tracking',
      impact: '50% easier debugging'
    },
    {
      feature: 'Faster Onboarding',
      value: 'AI assistance helps new team members understand codebase faster',
      impact: '30% quicker ramp-up'
    }
  ]

  const roadmapItems = [
    'Advanced AI models with better code understanding',
    'Support for additional project management tools (Azure DevOps, Linear)',
    'Team collaboration features and shared AI contexts',
    'Advanced code analysis and automated testing suggestions',
    'Integration with CI/CD pipelines for automated deployments'
  ]

  return (
    <>
      {/* Hero */}
      <Section 
        className="bg-gradient-to-br from-indigo-50 to-blue-100"
        kicker="What Makes Us Different"
        title="Unique Features"
        subtitle="Discover the capabilities that set Ticket to Code apart from other development tools"
      >
        <div></div>
      </Section>

      {/* Features Grid */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 group hover:shadow-lg transition-all duration-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{feature.icon}</span>
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                  {feature.category}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why It Matters */}
      <Section 
        className="bg-gray-50"
        title="Why It Matters"
        subtitle="See the real impact these features have on your development workflow"
      >
        <div className="space-y-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">
                    {benefit.feature}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.value}
                  </p>
                </div>
                <div className="lg:col-span-2 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-brand-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className="font-semibold text-brand-600 text-lg whitespace-nowrap">
                    {benefit.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Feature Comparison */}
      <Section 
        title="How We Compare"
        subtitle="See how Ticket to Code stacks up against traditional development workflows"
      >
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm border border-gray-200">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-6 font-semibold text-gray-900">Feature</th>
                <th className="text-center p-6 font-semibold text-gray-500">Traditional Workflow</th>
                <th className="text-center p-6 font-semibold text-brand-600">Ticket to Code</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: 'JIRA Integration',
                  traditional: '❌ Separate browser tabs',
                  ticketToCode: '✅ Built into VS Code'
                },
                {
                  feature: 'AI Assistance',
                  traditional: '❌ External tools only',
                  ticketToCode: '✅ Context-aware AI chat'
                },
                {
                  feature: 'Code Safety',
                  traditional: '⚠️ Manual review required',
                  ticketToCode: '✅ Automatic diff previews'
                },
                {
                  feature: 'Git Integration',
                  traditional: '❌ Manual branch creation',
                  ticketToCode: '✅ Auto-branch from tickets'
                },
                {
                  feature: 'Code Linking',
                  traditional: '❌ Manual documentation',
                  ticketToCode: '✅ Automatic CodeLens links'
                }
              ].map((row, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-b-0">
                  <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                  <td className="p-6 text-center text-gray-600">{row.traditional}</td>
                  <td className="p-6 text-center text-brand-600">{row.ticketToCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* What's Next */}
      <Section 
        className="bg-brand-50"
        title="What's Next"
        subtitle="Exciting features and improvements coming to Ticket to Code"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Roadmap Highlights</h3>
            <ul className="space-y-4">
              {roadmapItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-brand-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Involved</h3>
            <p className="text-gray-600 mb-6">
              Help shape the future of Ticket to Code by contributing ideas, reporting bugs, 
              or joining our development community.
            </p>
            <div className="space-y-3">
              <a 
                href="https://github.com/your-org/ticket-to-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center btn-secondary"
              >
                Report Issues
              </a>
              <a 
                href="https://github.com/your-org/ticket-to-code/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center btn-primary"
              >
                Join Discussions
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Install Ticket to Code today and transform your development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">
              Get Started
            </Link>
            <Link to="/developers" className="btn-secondary">
              Meet the Team
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}