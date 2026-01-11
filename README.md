# YatriConnect Frontend

Modern React + Vite implementation of the YatriConnect mobility companion. It mirrors the original Figma design (https://www.figma.com/design/L5vcXeuizHZNA0ZarQ3yA4/YatriConnect) with responsive layouts tailored for iPhone 17 Pro Max breakpoints and orientation-specific behaviour.

## Highlights
- End-to-end navigation shell with tabs for Live Navigation, Journey history, Analytics, and Settings (see src/App.tsx).
- Authentication splash flow with dedicated Login and Signup experiences and animated transitions.
- Crash and theft detection modals with motion/react animations and accessible Radix primitives.
- Reusable UI kit in src/components/ui built on Radix, shadcn-style patterns, Tailwind utility classes, and lucide-react icons.
- Orientation-aware layout helpers (portrait and landscape variants) baked into index.css and component class names.

## Tech Stack
- React 18 + TypeScript
- Vite 6 for dev/build tooling
- Tailwind-inspired utility CSS (compiled into src/index.css)
- Radix UI primitives, class-variance-authority, tailwind-merge
- motion/react for animations, embla-carousel for carousels, recharts for analytics visuals

## Structure
```
.
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Home.tsx
│   │   ├── LiveNavigation.tsx
│   │   ├── Journey*.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   ├── CrashDetection.tsx / TheftDetection.tsx
│   │   └── ui/… (Radix-based primitives)
│   ├── index.css
│   └── main.tsx
├── public entrypoints (index.html, vite.config.ts)
└── .gitignore (excludes build output)
```

## Getting Started
1. Install dependencies:
  ```bash
  npm install
  ```
2. Start the dev server:
  ```bash
  npm run dev
  ```
  Vite prints the local and network URLs; the shell expects a mobile viewport for best results.
3. Build for production:
  ```bash
  npm run build
  ```
  Output is written to the dist/ directory (ignored in Git).

## GitHub Pages Deployment
- Ensure the Vite base path matches the repository by keeping the value in [vite.config.ts](vite.config.ts#L5-L36) set to `/YatriConnect_Frontend/`.
- GitHub Actions workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds on pushes to `main` and publishes the `dist` folder.
- In the repository settings, switch Pages → Build and deployment to “GitHub Actions.”
- After the workflow succeeds, your site is available at `https://<username>.github.io/YatriConnect_Frontend/`; update the README badge/link if desired.

## Development Notes
- Authentication handlers in App.tsx are mocks; integrate your backend by replacing handleLogin/handleSignup.
- Live navigation screen raises onTriggerCrash when user taps the crash simulation; CrashDetection overlay handles acknowledgement.
- UI primitives in components/ui are framework-agnostic and can be reused across screens.
- Color tokens and layout variables live near the bottom of src/index.css alongside orientation-responsive utility classes.
- Keep generated assets (build/, dist/) out of version control; they are excluded via .gitignore.

## Contributing
Feel free to extend screens or wire real data sources. Follow existing component patterns (co-located modules, Tailwind-style utility classes, motion/react animations) and run npm run build before opening a pull request.
