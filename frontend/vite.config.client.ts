import { defineConfig } from 'vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [
      react(),
      {
        name: 'html-transform',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              req.url = '/index-client.html'
            }
            next()
          })
        },
      },
    ],
    server: {
      port: 5173,
      proxy: {
        '/gateway': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/gateway/, ''),
        },
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ws/, '/resource/ws'),
        }
      }
    },
    build: {
      outDir: 'dist-client',
      rollupOptions: {
        input: resolve(__dirname, 'index-client.html'),
      },
    },
    define: {
      'import.meta.env.APP_TYPE': JSON.stringify('client'),
    },
    root: '.',
    publicDir: 'public',
  }
})

