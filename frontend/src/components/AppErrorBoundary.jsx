import React from 'react';
import { clearBrowserData, writeStoredJson } from '../utils/storage.js';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, details: null };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      details: {
        message: error?.message || 'Unknown render error',
        stack: error?.stack || ''
      }
    };
  }

  componentDidCatch(error, info) {
    const payload = {
      message: error?.message || 'Unknown render error',
      stack: error?.stack || '',
      componentStack: info?.componentStack || '',
      time: new Date().toISOString()
    };

    console.error('MarketLoop render error:', payload);
    writeStoredJson('__marketloop_last_error__', payload, { storageType: 'session' });
    this.setState({ details: payload });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f8fa] px-4 py-10">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">MarketLoop</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">We hit a refresh issue, but your app is still safe.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Something in the saved browser state or page startup crashed the UI. Reload once more, or clear the stored app data if this keeps happening.
            </p>
            {this.state.details?.message && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Latest error</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{this.state.details.message}</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn bg-emerald-600 hover:bg-emerald-700"
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  clearBrowserData();
                  window.location.assign('/');
                }}
              >
                Reset saved browser data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
