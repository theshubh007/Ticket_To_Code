import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white border-t border-gray-200" role="contentinfo">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 font-semibold text-xl text-gray-900 mb-4">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5H18.5A1.5 1.5 0 0 1 20 7.5v2a2 2 0 0 0-2 2 2 2 0 0 0 2 2v2a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 15.5v-2a2 2 0 0 0 2-2 2 2 0 0 0-2-2v-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                <path d="M10 9.5 8 12l2 2.5M14 9.5 16 12l-2 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Ticket to Code</span>
                        </Link>
                        <p className="text-gray-600 max-w-md">
                            Streamline your workflow from JIRA tickets to code implementation with AI assistance,
                            safe diffs, and Git integration - all without leaving VS Code.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/features"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/developers"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    Developers
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/your-org/ticket-to-code"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://github.com/your-org/ticket-to-code/blob/main/docs/IDE-Design.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/your-org/ticket-to-code/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    Support
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://marketplace.visualstudio.com/items?itemName=your-publisher.ticket-to-code"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-brand-600 transition-colors"
                                >
                                    VS Code Marketplace
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-600 text-sm">
                        © {currentYear} Ticket to Code. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a
                            href="https://github.com/your-org/ticket-to-code"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="GitHub repository"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}