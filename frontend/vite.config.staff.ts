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
              req.url = '/index-staff.html'
            }
            next()
          })
        },
      },
    ],
    server: {
      port: 5174,
      host: true,
    },
    build: {
      outDir: 'dist-staff',
      rollupOptions: {
        input: resolve(__dirname, 'index-staff.html'),
      },
    },
    define: {
      'import.meta.env.APP_TYPE': JSON.stringify('staff'),
    },
    root: '.',
    publicDir: 'public',
  }
})

