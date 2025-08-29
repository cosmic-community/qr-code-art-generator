# QR Code Art Generator

![QR Code Art Generator](https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=300&fit=crop&auto=format)

Transform any URL into beautiful, artistic QR codes with this modern web application. Generate customizable QR codes with various styling options including colors, gradients, patterns, and design elements while maintaining full scannability.

## ✨ Features

- **Real-time QR Code Generation**: Instant QR code creation as you type
- **Artistic Customization**: Choose from multiple color schemes, gradients, and patterns
- **High-Quality Downloads**: Export QR codes in PNG, SVG, and PDF formats
- **Mobile Responsive**: Seamless experience across all devices
- **URL Validation**: Smart validation ensures proper link formatting
- **Template Management**: Save and reuse favorite QR code styles
- **Live Preview**: Real-time preview of your customized QR code
- **One-Click Download**: Instant download with optimized file sizes

<!-- CLONE_PROJECT_BUTTON -->

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> My app simply turns a link into an artistic looking QR code

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠 Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **QR Code Library** - High-quality QR code generation
- **Cosmic CMS** - Content management and template storage
- **Canvas API** - Advanced QR code styling and effects
- **File Download API** - Multiple export format support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your environment variables:
   ```env
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📡 Cosmic SDK Examples

### Fetching QR Code Templates
```typescript
import { cosmic } from '@/lib/cosmic'

// Get all QR code templates
const templates = await cosmic.objects
  .find({ type: 'qr-templates' })
  .props(['title', 'slug', 'metadata'])
  .depth(1)

// Get template by slug
const template = await cosmic.objects
  .findOne({ type: 'qr-templates', slug: 'gradient-sunset' })
  .depth(1)
```

### Saving User Preferences
```typescript
// Save user's favorite QR code style
await cosmic.objects.insertOne({
  type: 'user-preferences',
  title: 'User QR Preferences',
  metadata: {
    preferred_colors: ['#FF6B6B', '#4ECDC4'],
    default_style: 'rounded',
    export_format: 'png'
  }
})
```

## 🌐 Cosmic CMS Integration

The app integrates with Cosmic CMS to manage:

- **QR Templates** (`qr-templates`): Pre-designed QR code styles and themes
- **Color Palettes** (`color-palettes`): Curated color combinations for QR codes  
- **User Preferences** (`user-preferences`): Saved user settings and favorites
- **Generation History** (`qr-history`): Track of generated QR codes

Content editors can easily add new templates and color schemes through the Cosmic dashboard without touching code.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the project: `bun run build`
2. Deploy the `out` folder to Netlify
3. Configure environment variables
4. Set up continuous deployment

Make sure to configure your environment variables (`COSMIC_BUCKET_SLUG`, `COSMIC_READ_KEY`, `COSMIC_WRITE_KEY`) in your deployment platform.
