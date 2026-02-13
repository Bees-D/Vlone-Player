# Deploying Vlone Player 999

## Prerequisites
1. **GitHub Account**: Ensure this repository is pushed to GitHub.
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended)
1. Go to your Vercel Dashboard.
2. Click "Add New..." -> "Project".
3. Import your GitHub repository `Bees-D/Vlone-Player`.
4. Vercel will auto-detect Vite.
5. Add the following **Environment Variable**:
   - name: `VITE_API_PAT`
   - value: `your_personal_access_token` (if you have one, or leave blank/placeholder if not required yet)
6. Click **Deploy**.

### Option 2: Vercel CLI
1. Run `npm install -g vercel` (if not installed).
2. Run `vercel login`.
3. Run `vercel` in this directory.
4. Follow the prompts.
5. Run `vercel --prod` to deploy to production.

## Cloudflare Pages (Alternative)
1. Go to Cloudflare Dashboard -> Workers & Pages.
2. Create Application -> Connect to Git.
3. Select this repository.
4. Build Settings:
   - Framework: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Environment Variables:
   - `VITE_API_PAT`: `your_token`
6. Deploy.

## Verification
Once deployed, open the provided URL.
- The site should load immediately.
- If data is missing or loading indefinitely, verify the API status indicator in the sidebar.
- Check browser console for any errors.
