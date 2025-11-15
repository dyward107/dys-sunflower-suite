// TIER 1: GLOBAL NAVIGATION BAR
// Top horizontal bar - always visible
// Practice-wide features: Case Manager, Task Manager, Calendar, etc.

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sunflowerTheme } from '../../styles/sunflowerTheme';
import { useCaseStore } from '../../stores/caseStore';

export const GlobalNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCase, clearSelectedCase } = useCaseStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Navigation items for Tier 1 (Global/Practice-wide)
  const globalNavItems = [
    { id: 'cases', label: 'Case Manager', path: '/cases', icon: '📋' },
    { id: 'contacts', label: 'Contact Database', path: '/contacts', icon: '📞' },
    { id: 'tasks', label: 'Task Manager', path: '/tasks', icon: '✅' },
    { id: 'calendar', label: 'Calendar', path: '/calendar', icon: '📅' },
    { id: 'correspondence', label: 'Correspondence', path: '/correspondence', icon: '📧' },
    { id: 'discovery', label: 'Discovery & Evidence', path: '/discovery', icon: '🔍' },
    { id: 'reports', label: 'Reports & Templates', path: '/reports', icon: '📊' },
  ];

  const handleNavClick = (path: string, requiresCaseSelection = false) => {
    if (requiresCaseSelection && !selectedCase) {
      // Navigate to cases first if no case selected
      navigate('/cases');
      return;
    }
    
    // Clear case selection for global views
    if (path === '/cases' || path === '/contacts' || path === '/tasks' || path === '/calendar' || 
        path === '/correspondence' || path === '/discovery' || path === '/reports') {
      clearSelectedCase();
    }
    
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-sunflower-taupe/40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Left Section: Branding + Navigation */}
          <div className="flex items-center space-x-8">
            
            {/* App Branding */}
            <div 
              onClick={() => navigate('/cases')}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-2xl">🌻</span>
              <div>
                <h1 className="font-brand text-base font-bold text-sunflower-brown">
                  Dy's Sunflower Suite
                </h1>
                <p className="text-xs text-sunflower-brown/70 -mt-1">
                  Case Management System
                </p>
              </div>
            </div>

            {/* Global Navigation Items */}
            <div className="hidden lg:flex space-x-1">
              {globalNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActiveRoute(item.path)
                      ? 'bg-sunflower-gold text-white shadow-sm'
                      : 'text-sunflower-brown hover:bg-sunflower-beige/50 hover:text-sunflower-brown'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section: Case Info + Profile */}
          <div className="flex items-center space-x-4">
            
            {/* Selected Case Indicator */}
            {selectedCase && (
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-sunflower-gold/20 rounded-lg border border-sunflower-gold/30">
                <span className="text-sm font-medium text-sunflower-brown">
                  Current Case:
                </span>
                <span className="text-sm font-semibold text-sunflower-brown">
                  {selectedCase.case_name}
                </span>
                <button
                  onClick={clearSelectedCase}
                  className="text-xs text-sunflower-brown/70 hover:text-sunflower-brown ml-2"
                  title="Clear case selection"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 rounded-lg text-sunflower-brown hover:bg-sunflower-beige/50">
              <span className="text-base">☰</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-sunflower-brown hover:bg-sunflower-beige/50 transition-colors"
              >
                <div className="w-8 h-8 bg-sunflower-gold rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  DW
                </div>
                <span className="hidden sm:inline text-sm font-medium">Dy Ward</span>
                <span className="text-xs">▼</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sunflower-taupe/40 py-2 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-sunflower-brown hover:bg-sunflower-beige/50">
                    Profile Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-sunflower-brown hover:bg-sunflower-beige/50">
                    Preferences
                  </a>
                  <hr className="my-2 border-sunflower-taupe/30" />
                  <a href="#" className="block px-4 py-2 text-sm text-sunflower-brown hover:bg-sunflower-beige/50">
                    Sign Out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavBar;
