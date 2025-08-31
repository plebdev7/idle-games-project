import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isPages = process.env.BUILD_TARGET === 'pages'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    base: isPages ? '/idle-games-project/game-1/' : '/idle-games-project/',
    build: {
      outDir: isPages ? '../../dist/game-1' : 'dist',
      sourcemap: true,
      emptyOutDir: false // Don't clear shared dist directory
    }
  }
})
