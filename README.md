# WISAL E-Commerce Platform

WISAL is a next-generation e-commerce platform for Saudi Arabia that revolutionizes online shopping by replacing traditional static product images with short-form video content.

## Features

- 🎥 Video-first product discovery (TikTok/Reels style)
- 📱 Progressive Web App (PWA) - installable on iOS and Android
- 🌐 Bilingual support (English/Arabic) with RTL layout
- 💳 Saudi payment methods (Mada, STC Pay, Apple Pay)
- 🚚 Integrated shipping with local providers
- 🛍️ Complete marketplace with seller portal
- ⚡ High performance with adaptive video streaming

## Tech Stack

### Frontend
- Next.js 14+ (React 18+)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (server state)
- Video.js + HLS.js (video playback)

### Backend
- Node.js 20+ with Express
- TypeScript
- PostgreSQL (relational data)
- MongoDB (product catalog)
- Redis (caching & sessions)

### Infrastructure
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS S3 (video storage)
- CloudFlare CDN

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wisal-ecommerce-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development databases:
```bash
docker-compose up -d
```

4. Set up environment variables:
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your configuration
```

5. Start the development servers:
```bash
npm run dev
```

The frontend will be available at http://localhost:3000
The backend API will be available at http://localhost:3001

## Project Structure

```
wisal-ecommerce-platform/
├── apps/
│   ├── frontend/          # Next.js PWA
│   └── backend/           # Express API
├── packages/              # Shared packages (future)
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docker-compose.yml     # Local development databases
└── turbo.json            # Monorepo configuration
```

## Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run build` - Build all apps
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run format` - Format all code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Database Management

Start databases:
```bash
docker-compose up -d
```

Stop databases:
```bash
docker-compose down
```

Reset databases (WARNING: deletes all data):
```bash
docker-compose down -v
docker-compose up -d
```

## Testing

### Unit Tests
```bash
npm run test
```

### Property-Based Tests
Property-based tests are included in the test suite and run automatically with `npm run test`.

## Deployment

See `.github/workflows/ci.yml` for the CI/CD pipeline configuration.

## Documentation

- [Requirements](.kiro/specs/wisal-ecommerce-platform/requirements.md)
- [Design](.kiro/specs/wisal-ecommerce-platform/design.md)
- [Tasks](.kiro/specs/wisal-ecommerce-platform/tasks.md)

## License

Proprietary - All rights reserved


## Deployment

### Deploying to Vercel

#### Option 1: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Configure project settings:
   - **Root Directory**: `apps/frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
4. Click "Deploy"

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Windows
deploy-vercel.bat

# Linux/Mac
./deploy-vercel.sh
```

#### Troubleshooting Deployment

If you encounter a 404 error after deployment:
1. Verify **Root Directory** is set to `apps/frontend` in Vercel project settings
2. Check that the build completed successfully in the deployment logs
3. Ensure all environment variables are configured
4. Redeploy the project

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment guide.

### Environment Variables

Create `.env` files based on the `.env.example` files in each app directory:

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/wisal
MONGODB_URI=mongodb://localhost:27017/wisal
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
MOYASAR_API_KEY=your-moyasar-key
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
wisal-ecommerce-platform/
├── apps/
│   ├── frontend/          # Next.js PWA
│   └── backend/           # Express API
├── .kiro/
│   └── specs/             # Feature specifications
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docker-compose.yml     # Local development setup
└── vercel.json           # Vercel deployment config
```

## Development Workflow

1. **Start services**: `docker-compose up -d`
2. **Install dependencies**: `npm install`
3. **Run development servers**: `npm run dev`
4. **Run tests**: `npm test`
5. **Build for production**: `npm run build`

## Contributing

See [SETUP.md](./SETUP.md) for detailed development setup instructions.

## License

Proprietary - All rights reserved
