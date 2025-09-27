# Ticket to Code Website

A modern, responsive marketing website for the Ticket to Code VS Code extension. Built with Vite, React, TypeScript, and Tailwind CSS.

## 🌟 Overview

This website showcases the Ticket to Code extension with three main pages:

- **Home** - Landing page with hero section, feature overview, and social proof
- **Features** - Detailed feature breakdown with benefits and comparisons  
- **Developers** - Team directory with GitHub integration and dynamic profiles

## 🚀 Quickstart

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will start at `http://localhost:5173`

## 👥 Adding Developers

To add team members to the Developers page:

1. Edit `src/data/developers.json`
2. Add a new entry with the following structure:

```json
{
  "github": "username",
  "role": "Your Role (optional)",
  "blurb": "Custom bio text (optional, falls back to GitHub bio)"
}
```

**Note:** Just use the GitHub username (e.g., `"octocat"`), not the full URL. The system will automatically construct the profile URL and fetch the data.

The website will automatically fetch public GitHub profile data including:
- Name and avatar
- Bio (if no custom blurb provided)
- Location
- Profile and website links

## 🔧 Environment Variables

### GitHub API Integration

Create a `.env` file in the root directory:

```bash
# Optional: GitHub Personal Access Token
# Increases API rate limits from 60 to 5000 requests/hour
# Create at: https://github.com/settings/tokens (no scopes needed)
VITE_GITHUB_TOKEN=your_github_token_here
```

**Why use a token?**
- Without token: 60 requests/hour per IP
- With token: 5000 requests/hour
- Recommended for development and production

**Security:** The token is only used for public data and is not exposed in the client bundle.

## 🚀 Deployment

### GitHub Pages

1. **Using GitHub Actions (Recommended):**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. **Manual deployment:**

```bash
npm run build
# Push the dist/ folder to gh-pages branch
```

### Netlify

1. **Connect your repository** to Netlify
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables:** Add `VITE_GITHUB_TOKEN` in Netlify dashboard
4. **Deploy!** - Automatic deployments on every push

### Vercel

1. **Connect your repository** to Vercel
2. **Framework preset:** Vite (auto-detected)
3. **Build settings:**
   - Build command: `npm run build` 
   - Output directory: `dist`
4. **Environment variables:** Add `VITE_GITHUB_TOKEN` in Vercel dashboard
5. **Deploy!** - Automatic deployments on every push

## ♿ Accessibility

This website is built with accessibility in mind:

- **Semantic HTML** with proper landmarks (`<header>`, `<main>`, `<footer>`, `<nav>`)
- **Skip link** to main content for keyboard users
- **Focus management** with visible focus rings
- **ARIA labels** and descriptions where needed
- **Color contrast** meets WCAG AA standards
- **Keyboard navigation** for all interactive elements
- **Screen reader** friendly content structure

### Testing Accessibility

```bash
# Install axe-core for automated testing
npm install -D @axe-core/cli

# Run accessibility audit
npx axe-core http://localhost:5173
```

## ⚡ Performance

Performance optimizations included:

- **Code splitting** with Vite's automatic chunking
- **Image optimization** with proper loading attributes
- **Font optimization** with preconnect hints
- **Caching** of GitHub API responses (1 hour localStorage)
- **Minimal dependencies** for fast load times

### Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run Lighthouse audit
lighthouse http://localhost:5173 --view
```

**Target Lighthouse Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 🛠️ Development

### Project Structure

```
website/
├── public/
│   └── favicon.svg          # Brand favicon
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Nav.tsx         # Navigation with mobile menu
│   │   ├── Footer.tsx      # Site footer
│   │   ├── Section.tsx     # Page section wrapper
│   │   └── DevCard.tsx     # Developer profile card
│   ├── data/
│   │   └── developers.json # Team member data
│   ├── lib/
│   │   └── github.ts       # GitHub API integration
│   ├── pages/              # Route components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Features.tsx    # Features showcase
│   │   └── Developers.tsx  # Team directory
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles + Tailwind
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.cjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

### Key Technologies

- **Vite** - Fast build tool and dev server
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **GitHub API** - Dynamic developer profiles

### Customization

**Colors:** Edit `tailwind.config.cjs` to change the brand color scheme
**Content:** Update page content in `src/pages/`
**Styling:** Modify `src/index.css` for global styles
**Components:** Add new components in `src/components/`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on how to get started.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test locally: `npm run dev`
5. Build and test: `npm run build && npm run preview`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📞 Support

- **Documentation:** [GitHub Wiki](https://github.com/your-org/ticket-to-code/wiki)
- **Issues:** [GitHub Issues](https://github.com/your-org/ticket-to-code/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/ticket-to-code/discussions)

---

Built with ❤️ by the Ticket to Code team