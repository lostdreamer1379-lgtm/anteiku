import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import Player from "@/components/player/Player";

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

describe("Player component", () => {
  const episode = { animeId: 1, episodeNumber: 1, title: "Test Episode" };

  it("renders without crashing when a provider is active", () => {
    render(<Player episode={episode} totalEpisodes={12} />, { wrapper });
    // jsdom can't play video but the element should be present
    expect(document.body).toBeTruthy();
  });

  it("renders the sr-only live region for accessibility", () => {
    render(<Player episode={episode} totalEpisodes={12} />, { wrapper });
    // The sr-only div carries episode state for screen readers
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
