import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

// Stub Prisma so the test suite runs without a database connection.
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    profile: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    watchlistEntry: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), delete: vi.fn() },
    watchProgress: { findMany: vi.fn(), findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  },
}));

// Stub the Supabase admin client used by requireAuth middleware.
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-uuid" } },
        error: null,
      }),
    },
  }),
}));

const app = createApp();

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("anteiku-backend");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Unknown routes", () => {
  it("returns 404 for an unknown path", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe(true);
  });
});

describe("GET /api/watchlist (unauthenticated)", () => {
  it("returns 401 when no Bearer token is supplied", async () => {
    const res = await request(app).get("/api/watchlist");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/watchlist (validation)", () => {
  it("returns 401 without auth header", async () => {
    const res = await request(app).post("/api/watchlist").send({ animeId: 1, status: "WATCHING" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when animeId is missing", async () => {
    const res = await request(app)
      .post("/api/watchlist")
      .set("Authorization", "Bearer mock-token")
      .send({ status: "WATCHING" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid status value", async () => {
    const res = await request(app)
      .post("/api/watchlist")
      .set("Authorization", "Bearer mock-token")
      .send({ animeId: 1, status: "INVALID_STATUS" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/progress (validation)", () => {
  it("returns 400 when episodeNumber is missing", async () => {
    const res = await request(app)
      .post("/api/progress")
      .set("Authorization", "Bearer mock-token")
      .send({ animeId: 1 });
    expect(res.status).toBe(400);
  });
});
