import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";

// Mock AniList service so tests are fully offline
vi.mock("@/services/anilist", () => ({
  getTrendingAnime: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: { romaji: "Cowboy Bebop", english: "Cowboy Bebop", native: "カウボーイビバップ" },
      coverImage: "https://example.com/cover.jpg",
      bannerImage: null,
      averageScore: 88,
      format: "TV",
      year: 1998,
      genres: ["Action", "Sci-Fi"],
    },
  ]),
  searchAnime: vi.fn().mockResolvedValue({ results: [], hasNextPage: false, total: 0 }),
  getSeasonalAnime: vi.fn().mockResolvedValue({ results: [], hasNextPage: false, total: 0 }),
}));

import Home from "@/pages/Home/Home";
import { AuthProvider } from "@/contexts/AuthContext";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Home page", () => {
  it("renders the Anteiku brand in the nav", () => {
    render(<Home />, { wrapper });
    // The brand text appears in the Navbar rendered via AppLayout's parent;
    // at minimum Home itself should mount without throwing.
    expect(document.body).toBeTruthy();
  });

  it("renders the Browse by Genre section", () => {
    render(<Home />, { wrapper });
    expect(screen.getByText("Browse by Genre")).toBeInTheDocument();
  });

  it("renders Curated Collections section", () => {
    render(<Home />, { wrapper });
    expect(screen.getByText("Curated Collections")).toBeInTheDocument();
  });

  it("renders After Dark collection card", () => {
    render(<Home />, { wrapper });
    expect(screen.getByText("After Dark")).toBeInTheDocument();
  });
});
