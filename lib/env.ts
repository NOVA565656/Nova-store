function req(name: string, min = 1): string {
  const v = process.env[name];
  if (!v || v.length < min) {
    throw new Error(`[env] Missing or invalid: ${name} (min ${min} chars)`);
  }
  return v;
}

export const env = {
  SESSION_SECRET: req('SESSION_SECRET', 32),
  APP_URL: req('APP_URL'),
  SUPABASE_SERVICE_ROLE_KEY: req('SUPABASE_SERVICE_ROLE_KEY'),
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon',
} as const;