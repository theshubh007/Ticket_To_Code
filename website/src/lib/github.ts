export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  html_url: string
  blog: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
}

interface CachedUser {
  data: GitHubUser
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Extract username from GitHub URL or return username if already provided
 */
export function extractUsername(githubInput: string): string {
  // If it's already just a username (no URL), return it
  if (!githubInput.includes('/') && !githubInput.includes('.')) {
    return githubInput
  }
  
  try {
    const url = new URL(githubInput)
    const pathParts = url.pathname.split('/').filter(Boolean)
    return pathParts[0] || ''
  } catch {
    // If URL parsing fails, assume it's a username
    return githubInput
  }
}

/**
 * Get cached user data from localStorage
 */
function getCachedUser(username: string): GitHubUser | null {
  try {
    const cached = localStorage.getItem(`github_user_${username}`)
    if (!cached) return null
    
    const { data, timestamp }: CachedUser = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid (1 hour)
    if (now - timestamp < CACHE_DURATION) {
      return data
    }
    
    // Remove expired cache
    localStorage.removeItem(`github_user_${username}`)
    return null
  } catch (error) {
    console.warn('Error reading GitHub user cache:', error)
    return null
  }
}

/**
 * Cache user data in localStorage
 */
function setCachedUser(username: string, user: GitHubUser): void {
  try {
    const cached: CachedUser = {
      data: user,
      timestamp: Date.now()
    }
    localStorage.setItem(`github_user_${username}`, JSON.stringify(cached))
  } catch (error) {
    console.warn('Error caching GitHub user data:', error)
  }
}

/**
 * Create fallback user object from GitHub username or URL
 */
function createFallbackUser(githubInput: string): GitHubUser {
  const username = extractUsername(githubInput)
  return {
    login: username,
    name: username,
    avatar_url: `https://github.com/${username}.png`,
    bio: null,
    html_url: `https://github.com/${username}`,
    blog: null,
    location: null,
    public_repos: 0,
    followers: 0,
    following: 0
  }
}

/**
 * Fetch GitHub user data with caching and error handling
 * @param githubInput - GitHub username or full GitHub URL
 */
export async function fetchGitHubUser(githubInput: string): Promise<GitHubUser> {
  const username = extractUsername(githubInput)
  
  if (!username) {
    console.warn('Invalid GitHub input:', githubInput)
    return createFallbackUser(githubInput)
  }
  
  // Check cache first
  const cached = getCachedUser(username)
  if (cached) {
    return cached
  }
  
  try {
    // Prepare headers
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Ticket-to-Code-Website'
    }
    
    // Add authorization if token is available
    const token = import.meta.env.VITE_GITHUB_TOKEN
    if (token && token !== 'your_github_token_here') {
      headers.Authorization = `Bearer ${token}`
    }
    
    // Fetch user data
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`GitHub user not found: ${username}`)
      } else if (response.status === 403) {
        console.warn('GitHub API rate limit exceeded. Consider adding VITE_GITHUB_TOKEN to .env')
      } else {
        console.warn(`GitHub API error: ${response.status} ${response.statusText}`)
      }
      return createFallbackUser(githubInput)
    }
    
    const user: GitHubUser = await response.json()
    
    // Cache the successful response
    setCachedUser(username, user)
    
    return user
  } catch (error) {
    console.warn('Error fetching GitHub user:', error)
    return createFallbackUser(githubInput)
  }
}

/**
 * Batch fetch multiple GitHub users
 */
export async function fetchGitHubUsers(githubInputs: string[]): Promise<GitHubUser[]> {
  const promises = githubInputs.map(input => fetchGitHubUser(input))
  return Promise.all(promises)
}

/**
 * Clear all cached GitHub user data
 */
export function clearGitHubCache(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('github_user_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Error clearing GitHub cache:', error)
  }
}