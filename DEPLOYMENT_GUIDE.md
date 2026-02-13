# Deploying Juice WRLD Player to Cloudflare Pages

To host your high-fidelity music player on Cloudflare, follow these steps:

### Option 1: Git Integration (Recommended)
This is the easiest way. Every change you push to GitHub/GitLab will automatically deploy.

1.  **Push your code to GitHub**:
    *   Initialize a git repo if you haven't: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Initialize 999 Player"`
    *   Create a repo on GitHub and push.

2.  **Connect to Cloudflare Pages**:
    *   Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
    *   Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    *   Select your repository.

3.  **Configure Build Settings**:
    *   **Project Name**: `juice-wrld-player`
    *   **Framework preset**: `Vite`
    *   **Build command**: `npm run build`
    *   **Build output directory**: `dist`
    *   **Root directory**: `/` (unless you moved the folder)

4.  **Click "Save and Deploy"**.

---

### Option 2: Wrangler CLI (Manual Upload)
If you don't want to use Git, you can deploy directly from your terminal.

1.  **Install Wrangler**:
    ```powershell
    npm install -g wrangler
    ```

2.  **Build the Project**:
    ```powershell
    npm run build
    ```

3.  **Deploy to Pages**:
    ```powershell
    npx wrangler pages deploy dist
    ```
    *Follow the prompts to login and select/create a project.*

---

### Important: Handling Client-Side Routing
Since this is a Single Page Application (SPA), if you eventually add `react-router`, you need to tell Cloudflare to redirect all paths to `index.html`. 

I have created a `public/_redirects` file for you to handle this automatically:
`/* /index.html 200`
