<div align="center">
  <h1>Sinkhole Prediction UI Next</h1>
  <p><strong>A modern, responsive web application for sinkhole monitoring and analysis</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
</div>

---

## Overview

Sinkhole UI is a cutting-edge web application designed to provide comprehensive visualization and analysis tools for sinkhole monitoring. Built with modern web technologies and best practices, it delivers a fast, responsive, and intuitive user experience across all devices.

## Key Features

- **🎨 Modern Design** - Clean, intuitive interface built with React and Tailwind CSS
- **⚡ High Performance** - Server-side rendering and optimizations powered by Next.js
- **🔒 Type Safety** - Full TypeScript implementation for robust, maintainable code
- **📱 Responsive Layout** - Seamless experience across desktop, tablet, and mobile devices
- **🗺️ Interactive Mapping** - Dynamic map visualization for sinkhole locations
- **📊 Data Analytics** - Comprehensive data analysis and prediction features
- **🔄 Real-time Updates** - Live data synchronization and updates

## Technology Stack

| Category        | Technology                                    | Version |
| --------------- | --------------------------------------------- | ------- |
| Framework       | [Next.js](https://nextjs.org/)                | 16.x    |
| UI Library      | [React](https://react.dev/)                   | 19.x    |
| Language        | [TypeScript](https://www.typescriptlang.org/) | 5.x     |
| Styling         | [Tailwind CSS](https://tailwindcss.com/)      | 3.x     |
| Package Manager | [pnpm](https://pnpm.io/)                      | Latest  |

## Quick Start

### Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js** ≥ 18.0.0
- **pnpm** (recommended), npm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CPE-TungTungSahur/Sinkhole-UI-Next.git
cd Sinkhole-UI-Next

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
sinkhole-ui/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (pages)/          # Application pages
│   │   │   ├── map/          # Map visualization
│   │   │   └── members/      # Team members
│   │   ├── api/              # API routes
│   │   │   ├── dev/          # Development endpoints
│   │   │   └── v1/           # Production API v1
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── assets/               # Application assets
│   ├── components/           # Reusable components
│   │   ├── Footer.tsx
│   │   ├── LoadingBar.tsx
│   │   ├── Navbar.tsx
│   │   └── PointDetailsDrawer.tsx
│   ├── config/               # Configuration files
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utility libraries
│   └── utils/                # Helper functions
├── components.json           # Shadcn UI config
├── docker-compose.yml        # Docker composition
├── Dockerfile                # Container definition
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## Development

### Available Commands

| Command      | Description                              |
| ------------ | ---------------------------------------- |
| `pnpm dev`   | Start development server with hot reload |
| `pnpm build` | Create production build                  |
| `pnpm start` | Run production server                    |
| `pnpm lint`  | Run code linter                          |

### Development Guidelines

- **Code Quality**: Follow TypeScript best practices and maintain strict type safety
- **Naming Conventions**: Use descriptive, consistent naming for components and functions
- **Component Structure**: Keep components small, focused, and reusable
- **Styling**: Use Tailwind CSS utility classes; avoid custom CSS when possible
- **Documentation**: Comment complex logic and maintain updated documentation

### Branch Strategy

1. Create feature branches from `main`
2. Use descriptive branch names: `feat/`, `fix/`, `docs/`, `refactor/`
3. Submit pull requests with clear descriptions
4. Ensure all tests pass before merging

## Contributing

We welcome contributions from the community! To contribute:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to your branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure your code passes all checks

## Docker Support

Run the application using Docker:

```bash
# Build and run with Docker Compose
docker-compose up

# Build Docker image
docker build -t sinkhole-ui .

# Run container
docker run -p 3000:3000 sinkhole-ui
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Team

Developed by **CPE-TungTungSahur** team as part of the CPE101 Engineer Exploration project.

- 🔗 [GitHub Organization](https://github.com/CPE-TungTungSahur)
- 📧 For inquiries, please open an issue

## Acknowledgments

Special thanks to:

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment tools
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- All contributors and supporters of this project

---

<div align="center">
  <strong>Built with ❤️ by CPE-TungTungSahur</strong>
  <br>
  <sub>Need help? Open an <a href="https://github.com/CPE-TungTungSahur/Sinkhole-UI-Next/issues">issue</a></sub>
</div>
