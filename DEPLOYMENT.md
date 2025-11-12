# ProofViral Deployment Guide

Complete guide to deploy ProofViral to production.

## Prerequisites

- Node.js 18+ installed
- Supabase account
- Anthropic API key
- Stripe account (for payment processing)
- Netlify/Vercel account (for hosting)

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to Settings > API to find your project URL and anon key

### Set Up Database

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-setup.sql` and run it
3. This will create all necessary tables, indexes, and RLS policies

### Configure Storage Buckets

1. Go to Storage in your Supabase dashboard
2. Create three public buckets:
   - `review-photos` - For customer review images
   - `business-logos` - For business logo uploads
   - `social-cards` - For generated social media cards
3. Set all buckets to **public**

### Set Up Authentication

1. Go to Authentication > Providers
2. Enable Email authentication
3. Configure email templates (optional)
4. Set up redirect URLs for your production domain

## 2. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic Claude API
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
VITE_APP_URL=https://yourdomain.com
```

### Get API Keys

**Supabase:**
- URL and Anon Key: Supabase Dashboard > Settings > API

**Anthropic:**
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to API Keys section
3. Create a new API key

**Stripe:**
1. Sign up at [stripe.com](https://stripe.com)
2. Go to Developers > API Keys
3. Copy your publishable key

## 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 4. Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 5. Deploy to Netlify

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Option B: Deploy via Git

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in Netlify dashboard
7. Deploy!

## 6. Deploy to Vercel

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Via Git

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables
6. Deploy!

## 7. Configure Stripe Webhooks (Optional)

For production-ready subscription management:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to environment: `STRIPE_WEBHOOK_SECRET`

## 8. Security Considerations

### API Key Protection

⚠️ **Important:** The Anthropic API key is currently exposed in the browser. For production:

1. Create a serverless function to proxy Claude API calls
2. Move API key to server-side environment variables
3. Implement rate limiting

Example serverless function structure:
```
/api
  /analyze-sentiment.ts
  /generate-card.ts
```

### Content Security Policy

Add these headers to your deployment:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.anthropic.com
```

## 9. Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Submit a test review
- [ ] Approve a review from dashboard
- [ ] Test sentiment analysis
- [ ] Generate a social card
- [ ] Test widget embed code
- [ ] Verify Stripe integration
- [ ] Check mobile responsiveness
- [ ] Test all navigation links
- [ ] Verify email notifications work
- [ ] Check storage bucket permissions
- [ ] Test RLS policies

## 10. Monitoring & Analytics

### Supabase Dashboard

Monitor:
- Database performance
- API usage
- Storage usage
- Auth events

### Error Tracking

Consider adding:
- Sentry for error tracking
- Google Analytics for user analytics
- PostHog for product analytics

## 11. Scaling Considerations

### Database

- Add indexes for frequently queried fields
- Set up database backups
- Monitor query performance

### Storage

- Implement CDN for assets
- Set up image optimization
- Configure retention policies

### API Rate Limits

- Implement rate limiting for public endpoints
- Cache frequently accessed data
- Use Supabase Edge Functions for heavy operations

## 12. Custom Domain Setup

### Netlify

1. Go to Domain settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS

### Vercel

1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records
4. HTTPS is automatic

## 13. Maintenance

### Regular Tasks

- Monitor Supabase usage and upgrade plan if needed
- Review and respond to user feedback
- Update dependencies monthly
- Check security advisories
- Backup database regularly

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Build and deploy
npm run build
netlify deploy --prod
# or
vercel --prod
```

## Support

For issues or questions:
- GitHub Issues: [your-repo-url]
- Email: support@proofviral.com
- Documentation: [your-docs-url]

## License

Proprietary - All rights reserved
