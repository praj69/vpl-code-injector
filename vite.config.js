// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { resolve } from 'path';

// export default defineConfig({
//   base: './', // Required for correct file path in extension
//   plugins: [react()],
//   build: {
//     outDir: 'dist', // Final output folder for Chrome extension
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         popup: resolve(__dirname, 'src/popup.html') // build this as popup.html
//       },
//       output: {
//         // Flatten folder structure (no dist/src/)
//         entryFileNames: 'assets/[name].js',
//         chunkFileNames: 'assets/[name].js',
//         assetFileNames: 'assets/[name][extname]'
//       }
//     }
//   }
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './', // ✅ ensures relative paths like ./assets/popup.js
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false, // ✅ avoids <link rel="modulepreload"> which Chrome Extensions don't need
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'), // entry point for extension popup
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});





