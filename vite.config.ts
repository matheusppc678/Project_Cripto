import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Get the repository name for GitHub Pages
const getBase = () => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repoName ? `/${repoName}/` : '/';
};

export default defineConfig(() => ({
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
  base: getBase(),
}));