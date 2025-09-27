import { useState, useEffect } from 'react'
import Section from '../components/Section'
import DevCard from '../components/DevCard'
import { fetchGitHubUser, GitHubUser } from '../lib/github'
import developersData from '../data/developers.json'

interface Developer {
  github: string
  role?: string
  blurb?: string
}

interface DeveloperWithUser extends Developer {
  user: GitHubUser | null
  isLoading: boolean
  error?: string
}

export default function Developers() {
  const [developers, setDevelopers] = useState<DeveloperWithUser[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Initialize developers and fetch GitHub data
  useEffect(() => {
    const initializeDevelopers = async () => {
      // Set initial loading state
      const initialDevelopers: DeveloperWithUser[] = developersData.map(dev => ({
        ...dev,
        user: null,
        isLoading: true
      }))
      setDevelopers(initialDevelopers)
      setIsInitialLoad(false)

      // Fetch GitHub data for each developer
      const updatedDevelopers = await Promise.all(
        developersData.map(async (dev) => {
          try {
            const user = await fetchGitHubUser(dev.github)
            return {
              ...dev,
              user,
              isLoading: false
            }
          } catch (error) {
            console.error(`Error fetching data for ${dev.github}:`, error)
            return {
              ...dev,
              user: null,
              isLoading: false,
              error: 'Failed to load GitHub data'
            }
          }
        })
      )

      setDevelopers(updatedDevelopers)
    }

    initializeDevelopers()
  }, [])

  // Filter developers based on search term
  const filteredDevelopers = developers.filter(dev => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const name = dev.user?.name || dev.user?.login || ''
    const role = dev.role || ''
    const blurb = dev.blurb || dev.user?.bio || ''
    
    return (
      name.toLowerCase().includes(searchLower) ||
      role.toLowerCase().includes(searchLower) ||
      blurb.toLowerCase().includes(searchLower)
    )
  })

  return (
    <>
      {/* Hero */}
      <Section 
        className="bg-gradient-to-br from-purple-50 to-indigo-100"
        kicker="Meet the Team"
        title="Developers"
        subtitle="The passionate team behind Ticket to Code, building the future of development workflows"
      >
        <div></div>
      </Section>

      {/* Search and Info */}
      <Section>
        <div className="max-w-2xl mx-auto mb-12">
          {/* Search Box */}
          <div className="relative mb-6">
            <label htmlFor="developer-search" className="sr-only">
              Search developers by name or role
            </label>
            <input
              id="developer-search"
              type="text"
              placeholder="Search developers by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium mb-1">GitHub Integration</p>
                <p>
                  Developer profiles are automatically fetched using GitHub usernames. 
                  Avatars, bios, and profile links are pulled from public GitHub profiles 
                  and cached locally for one hour to improve performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isInitialLoad && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, index) => (
              <DevCard 
                key={index}
                user={{} as GitHubUser}
                isLoading={true}
              />
            ))}
          </div>
        )}

        {/* Developers Grid */}
        {!isInitialLoad && (
          <>
            {filteredDevelopers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevelopers.map((dev, index) => (
                  <DevCard
                    key={dev.github}
                    user={dev.user || {} as GitHubUser}
                    role={dev.role}
                    blurb={dev.blurb}
                    isLoading={dev.isLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No developers found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or{' '}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:underline"
                  >
                    clear the search
                  </button>
                  .
                </p>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Team Stats */}
      <Section className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Team Members', value: developersData.length.toString() },
            { label: 'GitHub Commits', value: '1,200+' },
            { label: 'Issues Resolved', value: '350+' },
            { label: 'Happy Users', value: '10,000+' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-brand-600 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Join the Team */}
      <Section 
        title="Want to Join Us?"
        subtitle="We're always looking for passionate developers to help improve the development experience"
      >
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Open Source Contributions Welcome
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Ticket to Code is open source and we welcome contributions from developers of all skill levels. 
            Whether you want to fix bugs, add features, or improve documentation, there's a place for you on our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/your-org/ticket-to-code/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Contributing Guide
            </a>
            <a 
              href="https://github.com/your-org/ticket-to-code/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Good First Issues
            </a>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section className="bg-brand-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get in Touch
          </h2>
          <p className="text-xl text-brand-100 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/your-org/ticket-to-code/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-brand-600 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              Start a Discussion
            </a>
            <a 
              href="https://github.com/your-org/ticket-to-code/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-brand-600 font-medium px-8 py-4 rounded-lg transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </Section>
    </>
  )
}