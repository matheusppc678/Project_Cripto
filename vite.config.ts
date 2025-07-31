import { defineConfig, loadEnv } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  // Get the repository name from GITHUB_REPOSITORY environment variable
  // This variable is typically available in GitHub Actions CI/CD environments
  const repoName = env.GITHUB_REPOSITORY?.split('/')[1];
  const base = repoName ? `/${repoName}/` : '/';

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Set the base URL for the application
    base: base,
    // Expose the base path as a client-side environment variable
    define: {
      'process.env.VITE_APP_BASENAME': JSON.stringify(base),
    },
  };
});