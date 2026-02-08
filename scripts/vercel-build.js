#!/usr/bin/env node

/**
 * Alternative Vercel build script
 * This script handles the build process with better error handling
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { build } from 'vite';

console.log('🚀 Starting Vercel build process...');
console.log('📦 Node version:', process.version);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

async function buildProject() {
  try {
    // Method 1: Try direct Vite API build
    console.log('🔨 Attempting Vite API build...');
    
    await build({
      root: process.cwd(),
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        },
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              gsap: ['gsap'],
              ui: ['lucide-react']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      }
    });
    
    console.log('✅ Vite API build completed successfully!');
    
    // Verify build output
    if (existsSync('dist/index.html')) {
      console.log('✅ Build verification: dist/index.html exists');
    } else {
      throw new Error('Build verification failed: dist/index.html not found');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Vite API build failed:', error.message);
    
    try {
      // Method 2: Try npx vite build as fallback
      console.log('🔄 Attempting fallback build with npx...');
      
      execSync('npx vite build', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ Fallback build completed successfully!');
      return true;
      
    } catch (fallbackError) {
      console.error('❌ Fallback build also failed:', fallbackError.message);
      
      try {
        // Method 3: Try direct node execution
        console.log('🔄 Attempting direct node build...');
        
        execSync('node node_modules/vite/bin/vite.js build', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        console.log('✅ Direct node build completed successfully!');
        return true;
        
      } catch (directError) {
        console.error('❌ All build methods failed');
        console.error('Direct error:', directError.message);
        throw new Error('Build process failed with all methods');
      }
    }
  }
}

// Run the build
buildProject()
  .then(() => {
    console.log('🎉 Build process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Build process failed:', error.message);
    process.exit(1);
  });