import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors so a single broken tool can't blank the whole app.
 * React error boundaries must be class components — this is the one documented
 * exception to our function-components-only rule (see CODING_STANDARDS.md § 3).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="wrap coming" role="alert">
          <p className="section-label">Something went wrong</p>
          <p className="lead">An unexpected error occurred. Reloading the page usually fixes it.</p>
        </main>
      );
    }
    return this.props.children;
  }
}
