import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Rendering Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground text-center">
          <div className="w-20 h-20 rounded-[var(--radius-lg)] bg-warning/10 border border-warning/20 flex items-center justify-center mb-6 text-warning shadow-xl shadow-warning/5">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <span className="text-xs font-mono tracking-widest text-warning uppercase bg-warning/10 border border-warning/20 px-3 py-1 rounded-full mb-3">
            Application Exception
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Something Went Wrong
          </h1>

          <p className="text-muted-foreground max-w-md text-sm mb-8">
            An unexpected error occurred while rendering this component. You can reload the application or return home.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-primary hover:bg-primary-hover text-sm font-medium transition-all shadow-lg shadow-primary/25 text-primary-foreground"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover text-sm font-medium transition-all"
            >
              <Home className="w-4 h-4" /> Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
