/**
 * Security Headers for Chamber Connect (Vite/React)
 * Use in production deployment (Vercel, Nginx, etc.)
 */

export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent referrer leakage
  'Referrer-Policy': 'no-referrer',
  
  // HTTPS enforcement (use after SSL verified)
  // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Minimal permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  
  // Frame protection (prevent clickjacking)
  'X-Frame-Options': 'DENY',
  
  // CSP - Report-Only mode for rollout
  'Content-Security-Policy-Report-Only': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Vite dev needs unsafe-inline
    "style-src 'self' 'unsafe-inline'",  // Tailwind needs unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; ')
} as const

/**
 * Generate HTML meta tags for client-side security headers
 * Use in index.html for basic protection
 */
export function generateSecurityMetaTags(): string {
  return `
    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="no-referrer">
    <meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
    <meta http-equiv="X-Frame-Options" content="DENY">
  `.trim()
}

/**
 * Vercel deployment headers configuration
 * Add to vercel.json in root
 */
export const VERCEL_HEADERS_CONFIG = {
  headers: [
    {
      source: "/(.*)",
      headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
        key,
        value: value.toString()
      }))
    }
  ]
}

/**
 * Nginx configuration snippet
 */
export const NGINX_HEADERS_SNIPPET = `
# Security Headers for Chamber Connect
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy no-referrer always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header X-Frame-Options DENY always;
add_header Content-Security-Policy-Report-Only "${SECURITY_HEADERS['Content-Security-Policy-Report-Only']}" always;
`

/**
 * Development security middleware for Vite
 * Add to vite.config.ts
 */
export function createSecurityMiddleware() {
  return {
    name: 'security-headers',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        // Apply security headers in development
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
          res.setHeader(key, value)
        })
        next()
      })
    }
  }
} 