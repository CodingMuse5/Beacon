import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 8000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8001",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
