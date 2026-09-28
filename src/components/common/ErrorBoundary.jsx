import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[260px] p-6 glass-panel rounded-2xl border border-rose-500/30 flex flex-col items-center justify-center text-center space-y-4 m-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-white">Something went wrong in this section</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              An unexpected error occurred while rendering this interface. Your data is safe.
            </p>
            {this.state.error && (
              <p className="mt-2 text-[11px] font-mono text-rose-300/80 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50 truncate">
                {this.state.error.message || String(this.state.error)}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
