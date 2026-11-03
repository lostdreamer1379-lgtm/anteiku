import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/anilist", () => ({
  searchAnime: vi.fn().mockResolvedValue({
    results: [
      {
        id: 20,
        title: { romaji: "Naruto", english: "Naruto", native: "ナルト" },
        coverImage: "https://example.com/naruto.jpg",
        bannerImage: null,
        averageScore: 79,
        format: "TV",
        year: 2002,
        genres: ["Action"],
      },
    ],
    hasNextPage: true,
    total: 1,
  }),
}));

import Explore from "@/pages/Explore/Explore";
import { AuthProvider } from "@/contexts/AuthContext";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/explore"]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Explore page", () => {
  it("renders the page heading", () => {
    render(<Explore />, { wrapper });
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<Explore />, { wrapper });
    expect(screen.getByPlaceholderText("Search by title…")).toBeInTheDocument();
  });

  it("renders the genre filter", () => {
    render(<Explore />, { wrapper });
    expect(screen.getByLabelText("Filter by genre")).toBeInTheDocument();
  });

  it("renders the sort selector", () => {
    render(<Explore />, { wrapper });
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
  });

  it("renders the clear all button only when a filter is active", () => {
    render(<Explore />, { wrapper });
    expect(screen.queryByText("Clear all")).not.toBeInTheDocument();
  });
});
