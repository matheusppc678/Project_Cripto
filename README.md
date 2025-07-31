# Welcome to your Dyad app

## Deployment Instructions

### Deploying to Vercel (Recommended)

1. **Prepare your project:**
   - Ensure your project is on GitHub
   - Verify that `index.html` is in the root directory
   - Confirm that the build process works locally with `npm run build`

2. **Deploy to Vercel:**
   - Sign up for a Vercel account at [https://vercel.com/](https://vercel.com/) using your GitHub account
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the project settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

3. **Configure SPA Routing:**
   - After deployment, go to your project settings in Vercel
   - Navigate to "Rewrites and Redirects"
   - Add a rewrite rule:
     - Source: `/*`
     - Destination: `/index.html`
   - This ensures all routes are handled by your React application

4. **Access your application:**
   - Your app will be available at `https://your-project-name.vercel.app`

### Deploying to GitHub Pages (Alternative)

1. **Install the deploy package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add these scripts to your package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Configure routing for GitHub Pages:**
   Create a `404.html` file in your `public` directory:
   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8">
       <title>Crypto Analyzer</title>
       <script>
         // Handle client-side routing for GitHub Pages
         (function() {
           const path = location.pathname.replace(/^\/[^\/]+\//, '/');
           if (path.match(/\/$/)) {
             location.replace(path + 'index.html');
           } else {
             location.replace('/' + location.pathname.split('/')[1] + '/index.html');
           }
         })();
       </script>
     </head>
     <body>
       <!-- Fallback content -->
       <p>Redirecting...</p>
     </body>
   </html>
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Configure GitHub Pages:**
   - Go to your repository settings on GitHub
   - Scroll down to "Pages" section
   - Select "gh-pages" branch as source
   - Your app will be available at `https://your-username.github.io/your-repo-name`

## Important Notes

- The application uses React Router for client-side routing
- For proper routing on static hosts, all routes must redirect to `index.html`
- The build process creates a `dist` folder with all production files
- Ensure your `vite.config.ts` has the correct base configuration for deployment