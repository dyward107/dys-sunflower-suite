// FLORAL BACKGROUND COMPONENT
// Reusable component for adding sunflower backgrounds to any screen

import React from 'react';

interface FloralPlacement {
  image: string;
  className: string;
}

interface FloralBackgroundProps {
  hero?: FloralPlacement;
  accent?: FloralPlacement;
  subtle?: FloralPlacement;
  children: React.ReactNode;
}

export const FloralBackground: React.FC<FloralBackgroundProps> = ({
  hero,
  accent,
  subtle,
  children,
}) => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Floral (Large, prominent) */}
      {hero && (
        <img
          src={hero.image}
          className={hero.className}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Accent Floral (Medium, supporting) */}
      {accent && (
        <img
          src={accent.image}
          className={accent.className}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Subtle Floral (Small, background detail) */}
      {subtle && (
        <img
          src={subtle.image}
          className={subtle.className}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* Content (rendered above florals) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default FloralBackground;

