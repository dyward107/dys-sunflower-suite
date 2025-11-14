// APP.TSX - MODULE A PHASE 1A
// Dy's Sunflower Suite v4.0
// Main application with routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavigationLayout } from './components/navigation/NavigationLayout';
import { CasePage } from './components/navigation/CasePage';
import { GlobalPage } from './components/navigation/GlobalPage';
import { CaseList } from './components/moduleA/CaseList';
import { CaseDetail } from './components/moduleA/CaseDetail';
import { CaseForm } from './components/moduleA/CaseForm';
import { ContactManager } from './components/moduleA/ContactManager';
import { CaseContactManager } from './components/moduleA/CaseContactManager';
import { PartiesTab } from './components/moduleA/PartiesTab';
import { PoliciesTab } from './components/moduleA/PoliciesTab';
import { CaseListLayout } from './components/layout/CaseListLayout';

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
        <NavigationLayout>
          <Routes>
            {/* Default route - redirect to cases */}
            <Route path="/" element={<Navigate to="/cases" replace />} />

            {/* Case routes - Your beautiful sunflower design applied! */}
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/new" element={<CaseForm />} />
            <Route path="/cases/:caseId" element={<CaseDetail />} />
            <Route path="/cases/:caseId/edit" element={<CaseForm />} />

            {/* Case-specific routes (Tier 2 navigation) */}
            <Route path="/cases/:caseId/parties" element={
              <CasePage title="Parties" icon="👥">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Parties Management</h2>
                  <p className="text-sunflower-brown/70">
                    Manage plaintiffs, defendants, and their relationships for this case.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/policies" element={
              <CasePage title="Policies" icon="📄">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Insurance Policies</h2>
                  <p className="text-sunflower-brown/70">
                    View and manage insurance policies related to this case.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/contacts" element={<CaseContactManager />} />
            <Route path="/cases/:caseId/timeline" element={
              <CasePage title="Treatment Timeline" icon="📅">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Medical Treatment Timeline</h2>
                  <p className="text-sunflower-brown/70">
                    Track medical treatments, appointments, and recovery progress.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/chronology" element={
              <CasePage title="Case Chronology" icon="📊">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Case Event Timeline</h2>
                  <p className="text-sunflower-brown/70">
                    Chronological timeline of all case events, filings, and important dates.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/issues" element={
              <CasePage title="Issues & Allegations" icon="⚖️">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Legal Issues & Allegations</h2>
                  <p className="text-sunflower-brown/70">
                    Track legal issues, allegations, and case theories.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/depositions" element={
              <CasePage title="Depositions" icon="🎤">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Deposition Management</h2>
                  <p className="text-sunflower-brown/70">
                    Schedule, prepare for, and manage depositions.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />
            <Route path="/cases/:caseId/trial" element={
              <CasePage title="Trial Notebook" icon="📚">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Trial Preparation</h2>
                  <p className="text-sunflower-brown/70">
                    Organize exhibits, witness lists, and trial strategy.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </CasePage>
            } />

            {/* Global routes (Tier 1 navigation) */}
            <Route path="/contacts" element={<ContactManager />} />
            <Route path="/tasks" element={
              <GlobalPage title="Task Manager" icon="✅">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Practice-wide Task Management</h2>
                  <p className="text-sunflower-brown/70">
                    Manage tasks across all cases and practice areas. Track deadlines, assignments, and priorities.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </GlobalPage>
            } />
            <Route path="/calendar" element={
              <GlobalPage title="Calendar" icon="📅">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Practice Calendar</h2>
                  <p className="text-sunflower-brown/70">
                    View all deadlines, appointments, and important dates across all cases.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </GlobalPage>
            } />
            <Route path="/correspondence" element={
              <GlobalPage title="Correspondence Log" icon="📧">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Global Correspondence</h2>
                  <p className="text-sunflower-brown/70">
                    Track all correspondence across cases. Letters, emails, and communications log.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </GlobalPage>
            } />
            <Route path="/discovery" element={
              <GlobalPage title="Discovery & Evidence Manager" icon="🔍">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Discovery & Evidence</h2>
                  <p className="text-sunflower-brown/70">
                    Manage discovery requests, evidence collection, and document production across all cases.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </GlobalPage>
            } />
            <Route path="/reports" element={
              <GlobalPage title="Reports & Templates" icon="📊">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold text-sunflower-brown mb-4">Reports & Document Templates</h2>
                  <p className="text-sunflower-brown/70">
                    Generate reports, analytics, and manage document templates for the practice.
                  </p>
                  <p className="text-sm text-sunflower-brown/50 mt-4">Coming soon...</p>
                </div>
              </GlobalPage>
            } />
            
            {/* 🌻 DESIGN DEMO - Optional showcase */}
            <Route path="/design-demo" element={<CaseListLayout />} />

            {/* Catch all - redirect to cases */}
            <Route path="*" element={<Navigate to="/cases" replace />} />
          </Routes>
        </NavigationLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
