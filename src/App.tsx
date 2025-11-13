// APP.TSX - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Main application with routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CaseList } from './components/moduleA/CaseList';
import { CaseDetail } from './components/moduleA/CaseDetail';
import { CaseForm } from './components/moduleA/CaseForm';

// Simple error boundary for debugging
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
            <p className="text-gray-700 mb-2">An error occurred while rendering the application:</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-4">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Default route - redirect to cases */}
            <Route path="/" element={<Navigate to="/cases" replace />} />

            {/* Case routes */}
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/cases/:caseId" element={<CaseDetail />} />
            <Route path="/cases/:caseId/edit" element={<CaseForm />} />

            {/* Catch all - redirect to cases */}
            <Route path="*" element={<Navigate to="/cases" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
