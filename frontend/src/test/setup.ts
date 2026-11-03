import "@testing-library/jest-dom";
import { vi } from "vitest";

// Suppress known jsdom limitations that are irrelevant for unit tests.
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Supabase client so tests never attempt real network calls.
vi.mock("@/services/auth/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  },
}));
