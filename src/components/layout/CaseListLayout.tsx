// CASE LIST LAYOUT - Demo of new design system
// Shows beautiful Case Manager list with sunflower theme and florals

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { sunflowerTheme } from '../../styles/sunflowerTheme';

// Floral assets
import heroSunflower from '../../assets/florals/heroes/sunflower-large-leaves.png';
import accentBud from '../../assets/florals/accents/sunflower-bud.png';
import subtleStems from '../../assets/florals/subtles/stem-leaves.png';

export const CaseListLayout: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleNewCase = () => {
    navigate('/cases/new');
  };

  const handleGoToCases = () => {
    navigate('/cases');
  };

  const handleCaseClick = (caseId: number) => {
    navigate(`/cases/${caseId}`);
  };

  // Demo data
  const cases = [
    {
      id: 1,
      cm_number: '1234.5678',
      case_name: 'Test v. Case',
      lead_attorney: 'Rebecca Strickland',
      status: 'Pre-Suit/Intake',
      phase: 'Open',
      date_opened: '11/12/2025',
    },
    {
      id: 2,
      cm_number: '2345.6789',
      case_name: 'Smith v. Johnson',
      lead_attorney: 'Dy Ward',
      status: 'Discovery',
      phase: 'Open',
      date_opened: '10/15/2025',
    },
    {
      id: 3,
      cm_number: '3456.7890',
      case_name: 'Brown v. Williams',
      lead_attorney: 'Kelly Chartash',
      status: 'Settled',
      phase: 'Closed',
      date_opened: '09/20/2025',
    },
  ];

  return (
    <AppLayout
      showBranding={true}
      hero={{
        image: heroSunflower,
        className: 'absolute top-0 left-0 w-[400px] opacity-30 pointer-events-none select-none',
      }}
      accent={{
        image: accentBud,
        className: 'absolute bottom-0 right-0 w-[200px] opacity-25 pointer-events-none select-none',
      }}
      subtle={{
        image: subtleStems,
        className: 'absolute top-0 right-0 w-[150px] opacity-15 pointer-events-none select-none',
      }}
    >
      {/* Demo Notice */}
      <div className="mb-6 rounded-3xl bg-sunflower-gold/20 border border-sunflower-gold/40 px-6 py-4">
        <h3 className="text-sunflower-brown font-bold mb-2">🌻 Design System Demo</h3>
        <p className="text-sunflower-brown/80 text-sm">
          This is a showcase of the new Sunflower design system. 
          <strong> Click "Go to Real Cases" below to see your actual case data with this beautiful new design!</strong>
        </p>
      </div>

      {/* Page Title & Actions */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className={sunflowerTheme.typography.styles.pageTitle}>
            Case Manager (Demo)
          </h2>

          <div className="flex gap-3">
            <button 
              onClick={handleNewCase}
              className={sunflowerTheme.buttons.primary}
            >
              + New Case
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={sunflowerTheme.buttons.secondary}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by case name, CM number, or party name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={sunflowerTheme.inputs.search}
          />
          <button 
            onClick={handleGoToCases}
            className={sunflowerTheme.buttons.primary}
          >
            Go to Real Cases
          </button>
        </div>

        {/* Filters (collapsible) */}
        {showFilters && (
          <div className="mt-4 rounded-3xl border border-sunflower-taupe/80 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Lead Attorney
                </label>
                <select className={sunflowerTheme.inputs.select + ' mt-1'}>
                  <option>All Attorneys</option>
                  <option>Rebecca Strickland</option>
                  <option>Dy Ward</option>
                  <option>Kelly Chartash</option>
                </select>
              </div>
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Status
                </label>
                <select className={sunflowerTheme.inputs.select + ' mt-1'}>
                  <option>All Statuses</option>
                  <option>Pre-Suit/Intake</option>
                  <option>Discovery</option>
                  <option>Settled</option>
                </select>
              </div>
              <div>
                <label className={sunflowerTheme.typography.styles.label}>
                  Phase
                </label>
                <select className={sunflowerTheme.inputs.select + ' mt-1'}>
                  <option>All Phases</option>
                  <option>Open</option>
                  <option>Pending</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Case Table */}
      <div className={sunflowerTheme.containers.tableWrapper}>
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 bg-sunflower-gold/90 text-sunflower-brown px-4 py-3">
          <div className="text-sm font-semibold uppercase tracking-wide">
            CM NUMBER
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            CASE NAME
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            LEAD ATTORNEY
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            STATUS
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            PHASE
          </div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            DATE OPENED
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-sunflower-taupe/30">
          {cases.map((caseItem, index) => (
            <div
              key={caseItem.id}
              onClick={() => handleCaseClick(caseItem.id)}
              className={`grid grid-cols-6 gap-4 px-4 py-3 transition-colors duration-150 cursor-pointer ${
                index % 2 === 0
                  ? 'bg-white/70 hover:bg-sunflower-beige/40'
                  : 'bg-sunflower-cream/20 hover:bg-sunflower-beige/40'
              }`}
            >
              <div className="text-sm text-sunflower-brown/90">
                {caseItem.cm_number}
              </div>
              <div className="text-sm text-sunflower-brown/90 font-medium">
                {caseItem.case_name}
              </div>
              <div className="text-sm text-sunflower-brown/90">
                {caseItem.lead_attorney}
              </div>
              <div className="text-sm text-sunflower-brown/90">
                {caseItem.status}
              </div>
              <div>
                <span
                  className={
                    caseItem.phase === 'Open'
                      ? sunflowerTheme.badges.open
                      : caseItem.phase === 'Pending'
                      ? sunflowerTheme.badges.pending
                      : sunflowerTheme.badges.closed
                  }
                >
                  {caseItem.phase}
                </span>
              </div>
              <div className="text-sm text-sunflower-brown/90">
                {caseItem.date_opened}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no cases) */}
        {cases.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sunflower-brown/70 mb-4">
              No cases found. Click "New Case" to get started.
            </p>
            <button className={sunflowerTheme.buttons.primary}>
              + New Case
            </button>
          </div>
        )}
      </div>

      {/* Design System Demo Section */}
      <div className="mt-12 rounded-3xl bg-white/85 border border-sunflower-taupe/60 shadow-md backdrop-blur-sm px-6 py-6">
        <h3 className={sunflowerTheme.typography.styles.h3 + ' mb-4'}>
          🎨 Design System Demo
        </h3>
        <div className="space-y-4">
          <div>
            <p className={sunflowerTheme.typography.styles.label + ' mb-2'}>
              Button Variants:
            </p>
            <div className="flex flex-wrap gap-3">
              <button className={sunflowerTheme.buttons.primary}>
                Primary
              </button>
              <button className={sunflowerTheme.buttons.secondary}>
                Secondary
              </button>
              <button className={sunflowerTheme.buttons.success}>
                Success
              </button>
              <button className={sunflowerTheme.buttons.danger}>Danger</button>
              <button className={sunflowerTheme.buttons.ghost}>Ghost</button>
            </div>
          </div>

          <div>
            <p className={sunflowerTheme.typography.styles.label + ' mb-2'}>
              Badge Variants:
            </p>
            <div className="flex flex-wrap gap-3">
              <span className={sunflowerTheme.badges.open}>Open</span>
              <span className={sunflowerTheme.badges.pending}>Pending</span>
              <span className={sunflowerTheme.badges.closed}>Closed</span>
              <span className={sunflowerTheme.badges.default}>Default</span>
            </div>
          </div>

          <div>
            <p className={sunflowerTheme.typography.styles.label + ' mb-2'}>
              Typography Styles:
            </p>
            <div className="space-y-2">
              <h1 className={sunflowerTheme.typography.styles.h1}>
                Heading 1 - Sunflower Brown
              </h1>
              <h2 className={sunflowerTheme.typography.styles.h2}>
                Heading 2 - Sunflower Brown
              </h2>
              <h3 className={sunflowerTheme.typography.styles.h3}>
                Heading 3 - Sunflower Brown
              </h3>
              <p className={sunflowerTheme.typography.styles.body}>
                Body text with warm, readable Quicksand font in sunflower brown.
              </p>
              <p className={sunflowerTheme.typography.styles.muted}>
                Muted text for secondary information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CaseListLayout;


