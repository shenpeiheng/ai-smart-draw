# Cloudflare Deployment Guide

This project supports deployment to Cloudflare Pages with Next.js SSR using the `@cloudflare/next-on-pages` adapter.

## Prerequisites

- Node.js 16.x or later
- npm or yarn
- A Cloudflare account

## Setup

The project is already configured for Cloudflare deployment. The following changes have been made:

1. Added required dependencies:
   ```bash
   npm install --save-dev @cloudflare/next-on-pages wrangler
   ```

2. Added deployment scripts to [package.json](package.json):
   - `pages:build`: Builds the application for Cloudflare Pages
   - `preview`: Runs a local development server that simulates Cloudflare Pages
   - `deploy`: Deploys the application to Cloudflare Pages

3. Created [wrangler.jsonc](wrangler.jsonc) with required compatibility flags

4. Added `export const runtime = "edge"` to all API routes

## Deployment Scripts

- `npm run pages:build` - Build the application for Cloudflare Pages
- `npm run preview` - Preview the application locally with Cloudflare simulation
- `npm run deploy` - Deploy to Cloudflare Pages

## Local Development

To test the Cloudflare Pages deployment locally:

```bash
npm run preview
```

This command will:
1. Build the application using `@cloudflare/next-on-pages`
2. Start a local server that simulates the Cloudflare Pages environment

## Production Deployment

To deploy to Cloudflare Pages:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Cloudflare Pages:
   - Go to the Cloudflare Dashboard
   - Select your account
   - Go to Pages
   - Click "Create a project"
   - Select your Git provider and repository
   - Configure the build settings:
     - Framework preset: Next.js
     - Build command: `npm run pages:build`
     - Build output directory: `.vercel/output/static`
3. Click "Save and Deploy"

Alternatively, you can deploy using the Wrangler CLI:

```bash
npm run deploy
```

Note: You'll need to configure your Cloudflare credentials for the Wrangler CLI first.

## Configuration Files

- [wrangler.jsonc](wrangler.jsonc): Contains Cloudflare Pages configuration including compatibility flags
- [next.config.ts](next.config.ts): Next.js configuration with edge runtime export

## Edge Runtime

All API routes in the [app/api](app/api) directory have been configured to run on the Edge Runtime, which is required for Cloudflare Pages compatibility. This was done by adding:

```typescript
export const runtime = "edge";
```

To each route file.

## Troubleshooting

If you encounter issues during deployment:

1. Make sure all API routes export the edge runtime
2. Check that you're using compatible Node.js APIs (use `nodejs_compat` flag)
3. Verify that your build command in Cloudflare Pages settings is set to `npm run pages:build`
4. Confirm that the build output directory is set to `.vercel/output/static`