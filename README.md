# ProofViral 🌟

An AI-powered testimonial and review management platform built with React, TypeScript, Supabase, and Claude AI.

![ProofViral](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-Proprietary-blue)

## Features

### 🎯 Core Functionality

- **Review Collection**: Beautiful, customizable forms for gathering customer testimonials
- **AI Sentiment Analysis**: Powered by Claude AI to understand customer emotions and extract key themes
- **Social Card Generator**: Auto-generate stunning social media graphics from reviews
- **Embeddable Widgets**: Drop-in widgets to showcase reviews on any website
- **Review Moderation**: Approve, reject, or flag reviews before they go live
- **Real-time Analytics**: Track reviews, ratings, and social shares

### 💎 Business Dashboard

- Overview with key metrics (total reviews, average rating, pending reviews)
- Advanced review management with filtering
- One-click AI sentiment analysis
- Social card generation and download
- Widget customization and embed code generator
- Subscription management

### 🎨 Design

- Modern, clean UI with purple/blue gradient accents
- Glassmorphism effects and smooth animations
- Fully responsive (mobile-first design)
- Dark mode support (coming soon)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Hosting**: Netlify/Vercel ready

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/proofviral.git
cd proofviral

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_key
# VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL script from `supabase-setup.sql` in your Supabase SQL Editor
3. Create storage buckets: `review-photos`, `business-logos`, `social-cards`

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
proofviral/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── DashboardLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ReviewWidget.tsx
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/               # Third-party integrations
│   │   └── supabase.ts
│   ├── pages/             # Page components
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Reviews.tsx
│   │   ├── Widget.tsx
│   │   ├── Billing.tsx
│   │   ├── Settings.tsx
│   │   └── ReviewForm.tsx
│   ├── types/             # TypeScript type definitions
│   │   ├── database.ts
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── sentiment.ts
│   │   └── socialCard.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── supabase-setup.sql   # Database schema
├── DEPLOYMENT.md        # Deployment guide
└── README.md           # This file
```

## Database Schema

### Tables

- **businesses**: Business profiles and settings
- **reviews**: Customer reviews and testimonials
- **social_cards**: Generated social media cards

### Storage Buckets

- **review-photos**: Customer uploaded images
- **business-logos**: Business logo uploads
- **social-cards**: Generated social media graphics

## API Integration

### Supabase

- Authentication (email/password)
- PostgreSQL database with RLS
- File storage
- Real-time subscriptions

### Anthropic Claude

- Sentiment analysis of reviews
- Theme extraction
- Natural language processing

### Stripe (Optional)

- Subscription management
- Payment processing
- Webhook handling

## Features in Detail

### Review Collection

- Star rating (1-5 stars)
- Text review (required)
- Photo upload (optional)
- Unique URL per business
- Social sharing after submission

### AI Sentiment Analysis

- Automatic emotion detection
- Sentiment scoring (0-1)
- Key theme extraction
- Label classification (positive/neutral/negative)

### Social Cards

- Instagram format (1080x1080)
- Twitter format (1200x675)
- Branded design with business logo
- One-click download
- Automatic storage

### Widget System

- Auto-rotating carousel
- Displays top 5-star reviews
- Responsive design
- "Leave a Review" CTA
- Simple embed code

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy

**Netlify:**
```bash
npm run build
netlify deploy --prod
```

**Vercel:**
```bash
vercel --prod
```

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe (optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App
VITE_APP_URL=https://yourdomain.com
```

## Security

- Row Level Security (RLS) enabled on all tables
- API key protection (move to serverless functions for production)
- Input validation and sanitization
- CSRF protection
- Secure authentication flow

## Performance

- Code splitting with React Router
- Lazy loading of routes
- Optimized images
- Cached API responses
- CDN-ready assets

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a proprietary project. For bug reports or feature requests, please contact support.

## Roadmap

- [ ] Email notifications for new reviews
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Mobile apps (iOS/Android)
- [ ] Review request automation
- [ ] Custom branding themes
- [ ] A/B testing for review forms

## License

Proprietary - All rights reserved © 2024 ProofViral

## Support

- Email: support@proofviral.com
- Documentation: https://docs.proofviral.com
- Status: https://status.proofviral.com

## Acknowledgments

- Built with [React](https://react.dev)
- Powered by [Supabase](https://supabase.com)
- AI by [Anthropic](https://anthropic.com)
- Icons by [Lucide](https://lucide.dev)
- Payments by [Stripe](https://stripe.com)

---

Made with ❤️ by the ProofViral team