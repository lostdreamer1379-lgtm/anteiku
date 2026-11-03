import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${key} — check .env against .env.example`);
  }
  return value ?? "";
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  databaseUrl: required("DATABASE_URL"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET"),
};
