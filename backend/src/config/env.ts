import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${key} — check .env against .env.example`);
  }
  return value ?? "";
}

const configuredFrontendOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigins: [...new Set([...configuredFrontendOrigins, "https://frontend-antieku.vercel.app"])],
  databaseUrl: required("DATABASE_URL"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET"),
};
