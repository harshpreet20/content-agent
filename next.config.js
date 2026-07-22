/** @type {import('next').NextConfig} */

// next/image needs an explicit allowlist of remote hosts. Product photos
// are served from this project's Supabase Storage bucket -- derive the
// hostname from the same env var everything else already uses, so there's
// nothing extra to configure per environment.
function supabaseImagePatterns() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [{ protocol: "https", hostname: new URL(url).hostname, pathname: "/storage/v1/object/public/**" }];
  } catch {
    return [];
  }
}

const nextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns(),
  },
}

module.exports = nextConfig
