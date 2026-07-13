<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dylan Islom — Personal Portfolio

A cyberpunk-themed personal portfolio for **Dylan (Islom)**, a Full-Stack Software Engineer specializing in backend systems, mobile development, and AI integration, based in Seoul.

Built with **React**, **TypeScript**, **Tailwind CSS v4**, and **Vite**, deployed on **Vercel**.

## Features

- 🖥️ **Cyberpunk/HUD aesthetic** with dark theme, scanlines, grid backgrounds, and terminal-style typography
- 🌐 **Bilingual support** — English & Korean
- 📱 **Fully responsive** — mobile-friendly navigation and layout
- 📬 **Serverless contact form** — sends emails via Nodemailer (Vercel Functions)
- ⚡ **Smooth animations** — powered by Motion (formerly Framer Motion)
- 🔗 **Project showcase** with live links and tech stack tags
- 📄 **Localized CV downloads** (English & Korean)
- 🛡️ **Production safeguards** — browser capability checks, local cache migration, privacy attribution, and `VITE_GEMMA_ENABLED` kill switch

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Build Tool** | Vite 6 |
| **Animation** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Backend** | Vercel Serverless Functions, Nodemailer |
| **Hosting** | Vercel |

## Getting Started

**Prerequisites:** Node.js 18+

1. Clone the repository:
   ```bash
   git clone https://github.com/BbooKki/personal-portfolio.git
   cd personal-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy the example file and fill in your Gmail app password:
   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `EMAIL_USER` — Gmail address for sending contact form emails
   - `EMAIL_PASS` — Gmail app password (not your regular password)

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Type-check with TypeScript |

## Project Structure

```
├── api/
│   └── contact.js          # Vercel serverless contact form handler
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles + Tailwind
│   ├── constants.tsx        # Projects, experience, skills data
│   ├── translations.ts     # English/Korean translations
│   └── components/
│       └── UI.tsx          # Reusable UI components
├── public/
│   ├── cv-en.pdf           # English CV
│   ├── cv-ko.pdf           # Korean CV
│   └── profile.png         # Profile photo
├── vercel.json             # Vercel deployment config
└── vite.config.ts          # Vite configuration
```

## Deployment

Deployed on Vercel with zero-config. The `vercel.json` handles SPA fallback routing and the `/api/contact` serverless function.

To temporarily disable the browser AI demo without removing it from the site, set the Vercel environment variable `VITE_GEMMA_ENABLED=false` and redeploy. Omit it or set it to `true` to enable the demo.

## License

Apache-2.0
