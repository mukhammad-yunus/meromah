import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: 'localhost', // Stick to localhost for now
      port: 5173,
      https: false,      // Explicitly disable
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET, // https://api.unime.space
          changeOrigin: true,            // REQUIRED for external APIs
          secure: false,                 // Prevents SSL handshake issues during proxying
          cookieDomainRewrite: 'localhost', // Rewrite cookie domain to localhost
          cookiePathRewrite: '/',        // Ensure cookies work on localhost
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Forward all cookies from the original request
              if (req.headers.cookie) {
                proxyReq.setHeader('Cookie', req.headers.cookie);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Rewrite Set-Cookie headers to work with localhost
              const setCookieHeaders = proxyRes.headers['set-cookie'];
              if (setCookieHeaders) {
                proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
                  return cookie
                    .replace(/Domain=[^;]+/gi, 'Domain=localhost')
                    .replace(/Secure/gi, '') // Remove Secure flag for http://localhost
                    .replace(/;\s*Secure/gi, '');
                });
              }
            });
          },
        }
      }
    }
  }
})