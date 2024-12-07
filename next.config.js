/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://uyyvxnlivatysbplzhwz.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eXZ4bmxpdmF0eXNicGx6aHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MjU5NTgsImV4cCI6MjA0NzIwMTk1OH0._Ys7sVpn1g_iEvbCef2LQGHXFGEpXanrRCgkt_yITGs'
  }
}

module.exports = nextConfig
