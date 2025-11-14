// APP LAYOUT - Main wrapper for all screens
// Provides gradient background, global navigation, and optional floral decorations

import React from 'react';
import { FloralBackground } from './FloralBackground';

interface FloralPlacement {
  image: string;
  className: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  showBranding?: boolean;
  hero?: FloralPlacement;
  accent?: FloralPlacement;
  subtle?: FloralPlacement;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showBranding = true,
  hero,
  accent,
  subtle,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sunflower-cream via-sunflower-beige to-[#FFF2C0]">
      <FloralBackground hero={hero} accent={accent} subtle={subtle}>
        {/* Global Branding Header (optional) */}
        {showBranding && (
          <header className="relative z-20 px-6 py-4 md:px-10 md:py-6">
            <div className="flex items-center gap-3">
              {/* Sunflower Icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-3xl">🌻</span>
              </div>
              {/* App Title */}
              <h1 className="font-brand text-3xl md:text-4xl font-bold text-sunflower-brown tracking-wide">
                Dy's Sunflower Suite
              </h1>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-4 md:px-10 md:py-8">
          {children}
        </main>
      </FloralBackground>
    </div>
  );
};

export default AppLayout;

