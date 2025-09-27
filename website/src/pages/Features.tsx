import { Link } from 'react-router-dom'
import Section from '../components/Section'

export default function Features() {

  const features = [
    // Workflow Features
    {
      category: 'Workflow',
      title: 'Git Branch Automation',
      description: 'Automatically create and switch to feature branches based on ticket information.',
      icon: '🌿',
      color: 'from-green-500 to-green-600',
      stats: { value: '60%', label: 'Time Saved' },
      details: ['Auto-branch naming', 'Smart branch switching', 'Commit linking']
    },
    
    // Safety Features
    {
      category: 'Safety',
      title: 'Safe Diff Previews',
      description: 'Review AI-generated changes with side-by-side diffs before applying to your codebase.',
      icon: '🔍',
      color: 'from-purple-500 to-purple-600',
      stats: { value: '80%', label: 'Fewer Bugs' },
      details: ['Side-by-side comparison', 'Change highlighting', 'Rollback capability']
    },
    {
      category: 'Safety',
      title: 'Virtual Documents',
      description: 'Preview changes in virtual documents to ensure safety before committing to files.',
      icon: '📄',
      color: 'from-orange-500 to-orange-600',
      stats: { value: '100%', label: 'Safe Previews' },
      details: ['Non-destructive preview', 'Syntax highlighting', 'Error detection']
    },
    
    // Productivity Features
    {
      category: 'Productivity',
      title: 'CodeLens Integration',
      description: 'Link code functions directly to tickets with inline CodeLens annotations.',
      icon: '📎',
      color: 'from-pink-500 to-pink-600',
      stats: { value: '50%', label: 'Better Traceability' },
      details: ['Inline annotations', 'Ticket linking', 'Code navigation']
    },
    {
      category: 'Productivity',
      title: 'Code Indexing',
      description: 'Intelligent workspace indexing for better context awareness and search.',
      icon: '🔎',
      color: 'from-indigo-500 to-indigo-600',
      stats: { value: '90%', label: 'Search Accuracy' },
      details: ['Smart indexing', 'Contextual search', 'Relevance scoring']
    },
    
    // Intelligence Features
    {
      category: 'Intelligence',
      title: 'AI Assistant',
      description: 'Chat with AI for code suggestions, explanations, and implementation guidance.',
      icon: '🤖',
      color: 'from-cyan-500 to-cyan-600',
      stats: { value: '70%', label: 'Faster Problem Solving' },
      details: ['Natural language chat', 'Code explanations', 'Implementation help']
    },
    {
      category: 'Intelligence',
      title: 'Context-Aware Suggestions',
      description: 'AI understands your ticket context and provides relevant code suggestions.',
      icon: '🧠',
      color: 'from-emerald-500 to-emerald-600',
      stats: { value: '85%', label: 'Relevant Suggestions' },
      details: ['Ticket-aware AI', 'Smart recommendations', 'Context learning']
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
        className="bg-gradient-to-br from-indigo-50 to-blue-100 relative overflow-hidden"
        kicker="What Makes Us Different"
        title="Unique Features"
        subtitle="Discover the capabilities that set Ticket to Code apart from other development tools"
      >
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-full mb-6 animate-pulse">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive suite of features transforms how you work with JIRA tickets and code, 
            making development more efficient and enjoyable.
          </p>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </Section>

      {/* Interactive Features Showcase */}
      <Section className="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the powerful features that make Ticket to Code the ultimate development companion
            </p>
          </div>

          {/* Feature Cards - 2 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="card p-6 group h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-xl shadow-lg`}>
                          {feature.icon}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                            {feature.category}
                          </span>
                          <h3 className="font-semibold text-base text-gray-900 group-hover:text-brand-600 transition-colors">
                            {feature.title}
                          </h3>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{feature.stats.value}</div>
                        <div className="text-xs text-gray-600">{feature.stats.label}</div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                      {feature.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {feature.details.slice(0, 2).map((detail, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {detail}
                        </span>
                      ))}
                      {feature.details.length > 2 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{feature.details.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Performance Metrics */}
      <Section 
        className="bg-white"
        title="Performance Metrics"
        subtitle="Real data showing the impact of our features on development productivity"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { metric: '40%', label: 'Faster Development', icon: '⚡', color: 'text-yellow-500' },
            { metric: '60%', label: 'Fewer Bugs', icon: '🐛', color: 'text-red-500' },
            { metric: '50%', label: 'Better Traceability', icon: '🔍', color: 'text-blue-500' },
            { metric: '30%', label: 'Quicker Onboarding', icon: '🚀', color: 'text-green-500' }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`text-4xl mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.metric}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Interactive Benefits */}
        <div className="space-y-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
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
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: '75%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
                    </div>
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
        className="bg-gray-50"
        title="How We Compare"
        subtitle="See how Ticket to Code stacks up against traditional development workflows"
      >
        <div className="overflow-x-auto">
          <div className="min-w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-0">
              {/* Header */}
              <div className="bg-gray-50 p-6 font-semibold text-gray-900 border-b border-gray-200">Feature</div>
              <div className="bg-gray-50 p-6 font-semibold text-gray-500 text-center border-b border-gray-200">Traditional Workflow</div>
              <div className="bg-brand-50 p-6 font-semibold text-brand-600 text-center border-b border-gray-200">Ticket to Code</div>
              
              {/* Rows */}
              {[
                {
                  feature: 'AI Assistance',
                  traditional: '❌ External tools only',
                  ticketToCode: '✅ Context-aware AI chat',
                  icon: '🤖'
                },
                {
                  feature: 'Code Safety',
                  traditional: '⚠️ Manual review required',
                  ticketToCode: '✅ Automatic diff previews',
                  icon: '🔍'
                },
                {
                  feature: 'Git Integration',
                  traditional: '❌ Manual branch creation',
                  ticketToCode: '✅ Auto-branch from tickets',
                  icon: '🌿'
                },
                {
                  feature: 'Code Linking',
                  traditional: '❌ Manual documentation',
                  ticketToCode: '✅ Automatic CodeLens links',
                  icon: '📎'
                },
                {
                  feature: 'Code Indexing',
                  traditional: '❌ Basic file search',
                  ticketToCode: '✅ Intelligent context search',
                  icon: '🔎'
                }
              ].map((row, index) => (
                <div key={index} className="contents">
                  <div className="p-6 font-medium text-gray-900 flex items-center space-x-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-xl">{row.icon}</span>
                    <span>{row.feature}</span>
                  </div>
                  <div className="p-6 text-center text-gray-600 border-b border-gray-100 last:border-b-0">{row.traditional}</div>
                  <div className="p-6 text-center text-brand-600 font-medium border-b border-gray-100 last:border-b-0">{row.ticketToCode}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* What's Next */}
      <Section 
        className="bg-gradient-to-br from-brand-50 to-indigo-50"
        title="What's Next"
        subtitle="Exciting features and improvements coming to Ticket to Code"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Roadmap Highlights</h3>
            <div className="space-y-4">
              {roadmapItems.map((item, index) => (
                <div key={index} className="flex items-start group">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-brand-600 h-1 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(index + 1) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Involved</h3>
              <p className="text-gray-600 mb-6">
                Help shape the future of Ticket to Code by contributing ideas, reporting bugs, 
                or joining our development community.
              </p>
            </div>
            <div className="space-y-3">
              <a 
                href="https://github.com/your-org/ticket-to-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center btn-secondary hover:bg-gray-100 transition-colors"
              >
                Report Issues
              </a>
              <a 
                href="https://github.com/your-org/ticket-to-code/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center btn-primary hover:bg-brand-600 transition-colors"
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