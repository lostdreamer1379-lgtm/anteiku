import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd send to your error tracker (e.g. Sentry).
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sage">Something broke</p>
          <h2 className="font-serif text-2xl text-ivory">This page spilled its coffee.</h2>
          <p className="max-w-sm text-sm text-muted">
            An unexpected error occurred. Try refreshing — if it persists, go back to the previous page.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => { this.setState({ hasError: false, message: "" }); window.location.reload(); }}
              className="rounded-anteiku border border-border-subtle px-4 py-2 text-sm text-muted hover:text-ivory"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.assign("/");
                }
              }}
              className="rounded-anteiku bg-forest px-4 py-2 text-sm text-ivory hover:bg-sage hover:text-bg-primary"
            >
              Go back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
