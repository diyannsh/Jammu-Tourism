import { defineConfig } from 'vite';

export default defineConfig({
  // CRITICAL: This must match your GitHub repository name exactly
  base: '/Jammu-Tourism/', 
  
  server: {
    host: true, // Allows you to test the site on your phone via local Wi-Fi
    open: true  // Automatically opens the browser on server start
  }
});