// 🌻 SUNFLOWER SUITE DESIGN SYSTEM
// Comprehensive theme configuration for consistent, beautiful UI

export const sunflowerTheme = {
  // ==========================================================================
  // COLOR PALETTE
  // ==========================================================================
  colors: {
    // Primary Palette
    cream: '#FFF9C4',          // Page backgrounds, light highlights
    beige: '#FFECB3',          // Cards, containers, panels
    green: '#AED581',          // Success states, positive accents
    taupe: '#D7CCC8',          // Borders, dividers, neutral containers
    taupeLigh: '#E8E0DC',      // Subtle borders
    brown: '#633112',          // Primary text, headings, "ink" color
    gold: '#E3A008',           // Primary actions, buttons, accents
    goldDark: '#C98506',       // Hover states for gold elements
    
    // Semantic Colors
    success: '#AED581',
    warning: '#FFECB3',
    error: '#EF5350',
    info: '#E3A008',
  },

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  typography: {
    fonts: {
      brand: 'Sirivennela, serif',       // Application name/branding only
      base: 'Quicksand, sans-serif',      // Everything else
    },
    
    // Text Styles
    styles: {
      // Branding
      appTitle: 'font-brand text-4xl md:text-5xl font-bold text-sunflower-brown tracking-wide',
      pageTitle: 'font-base text-3xl md:text-4xl font-semibold text-sunflower-brown',
      
      // Headings
      h1: 'font-base text-2xl md:text-3xl font-semibold text-sunflower-brown',
      h2: 'font-base text-xl md:text-2xl font-semibold text-sunflower-brown',
      h3: 'font-base text-lg font-semibold text-sunflower-brown',
      
      // Section Headers (uppercase, spaced)
      sectionHeader: 'font-base text-sm font-semibold uppercase tracking-wide text-sunflower-brown/90',
      
      // Labels
      label: 'font-base text-xs font-semibold uppercase tracking-wide text-sunflower-brown/80',
      fieldLabel: 'font-base text-sm font-medium text-sunflower-brown/90',
      
      // Body Text
      body: 'font-base text-sm text-sunflower-brown/90',
      bodyLarge: 'font-base text-base text-sunflower-brown/90',
      bodySmall: 'font-base text-xs text-sunflower-brown/80',
      
      // Muted Text
      muted: 'font-base text-sm text-sunflower-brown/70',
      caption: 'font-base text-xs text-sunflower-brown/60',
    },
  },

  // ==========================================================================
  // BUTTONS
  // ==========================================================================
  buttons: {
    // Primary Action (Gold)
    primary: 'rounded-full bg-sunflower-gold text-white px-6 py-2.5 text-sm font-semibold shadow-md shadow-sunflower-gold/40 hover:bg-sunflower-gold-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:ring-offset-2 focus:ring-offset-sunflower-cream',
    
    // Secondary (Outlined)
    secondary: 'rounded-full border-2 border-sunflower-gold bg-white text-sunflower-brown px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-sunflower-cream hover:border-sunflower-gold-dark hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:ring-offset-2 focus:ring-offset-sunflower-cream',
    
    // Success/Positive
    success: 'rounded-full bg-sunflower-green text-sunflower-brown px-6 py-2.5 text-sm font-semibold shadow-sm hover:bg-sunflower-green/80 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sunflower-green focus:ring-offset-2',
    
    // Danger/Delete
    danger: 'rounded-full bg-red-500 text-white px-6 py-2.5 text-sm font-semibold shadow-sm hover:bg-red-600 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    
    // Ghost/Minimal
    ghost: 'rounded-full text-sunflower-brown px-4 py-2 text-sm font-medium hover:bg-sunflower-cream/50 transition-colors duration-200',
    
    // Link Style
    link: 'text-sunflower-brown/80 text-sm hover:text-sunflower-brown hover:underline transition-colors duration-200',
  },

  // ==========================================================================
  // CARDS & CONTAINERS
  // ==========================================================================
  containers: {
    // Floating white cards (main content)
    card: 'rounded-3xl bg-white/85 border border-sunflower-taupe/60 shadow-[0_12px_30px_rgba(99,49,18,0.15)] backdrop-blur-sm',
    
    // Card sections
    cardSection: 'rounded-3xl bg-white/80 border border-sunflower-taupe/60 shadow-md backdrop-blur-sm px-6 py-6',
    
    // Inner card sections (within main card)
    innerSection: 'rounded-2xl bg-sunflower-cream/30 border border-sunflower-taupe/40 p-4',
    
    // Panel/Group container
    panel: 'rounded-2xl bg-white/70 border border-sunflower-taupe/50 p-4',
    
    // Table container
    tableWrapper: 'rounded-3xl bg-white/80 border border-sunflower-taupe/60 shadow-[0_10px_25px_rgba(99,49,18,0.15)] overflow-hidden',
    
    // Modal container (high opacity for readability)
    modal: 'rounded-3xl bg-white/95 border border-sunflower-taupe/60 shadow-[0_20px_50px_rgba(99,49,18,0.25)] backdrop-blur-md',
  },

  // ==========================================================================
  // FORM INPUTS
  // ==========================================================================
  inputs: {
    // Text input
    text: 'w-full rounded-full border border-sunflower-taupe bg-white/90 px-4 py-2.5 text-sm text-sunflower-brown shadow-inner shadow-white/60 placeholder:text-sunflower-brown/50 focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:border-sunflower-gold transition-all duration-200',
    
    // Textarea
    textarea: 'w-full rounded-2xl border border-sunflower-taupe bg-white/90 px-4 py-3 text-sm text-sunflower-brown shadow-inner shadow-white/60 placeholder:text-sunflower-brown/50 focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:border-sunflower-gold transition-all duration-200 resize-none',
    
    // Select dropdown
    select: 'w-full rounded-full border border-sunflower-taupe bg-white px-4 py-2.5 text-sm text-sunflower-brown focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:border-sunflower-gold transition-all duration-200',
    
    // Checkbox (custom styled)
    checkbox: 'w-4 h-4 rounded border-sunflower-taupe text-sunflower-gold focus:ring-sunflower-gold focus:ring-offset-0',
    
    // Search bar (special styling)
    search: 'w-full rounded-full border border-sunflower-taupe bg-white/90 px-5 py-3 text-sm text-sunflower-brown shadow-inner shadow-white/60 placeholder:text-sunflower-brown/50 focus:outline-none focus:ring-2 focus:ring-sunflower-gold focus:border-sunflower-gold transition-all duration-200',
  },

  // ==========================================================================
  // BADGES & TAGS
  // ==========================================================================
  badges: {
    // Status badges
    open: 'inline-flex items-center px-3 py-1 rounded-full bg-sunflower-green/70 text-sunflower-brown text-xs font-semibold',
    pending: 'inline-flex items-center px-3 py-1 rounded-full bg-sunflower-gold/70 text-white text-xs font-semibold',
    closed: 'inline-flex items-center px-3 py-1 rounded-full bg-sunflower-taupe/70 text-sunflower-brown text-xs font-semibold',
    
    // Generic badge
    default: 'inline-flex items-center px-3 py-1 rounded-full bg-sunflower-beige text-sunflower-brown text-xs font-semibold border border-sunflower-taupe/50',
  },

  // ==========================================================================
  // TABLE STYLES
  // ==========================================================================
  table: {
    // Header row
    header: 'bg-sunflower-gold/90 text-sunflower-brown text-sm font-semibold uppercase tracking-wide',
    headerCell: 'px-4 py-3 text-left',
    
    // Body rows
    row: 'bg-white/70 hover:bg-sunflower-beige/40 border-b border-sunflower-taupe/30 transition-colors duration-150',
    cell: 'px-4 py-3 text-sunflower-brown/90 text-sm',
    
    // Alternating rows
    rowEven: 'bg-white/70 hover:bg-sunflower-beige/40',
    rowOdd: 'bg-sunflower-cream/20 hover:bg-sunflower-beige/40',
  },

  // ==========================================================================
  // BACKGROUNDS
  // ==========================================================================
  backgrounds: {
    // Page background gradient
    page: 'bg-gradient-to-br from-sunflower-cream via-sunflower-beige to-[#FFF2C0]',
    
    // Modal overlay
    modalOverlay: 'bg-sunflower-brown/20 backdrop-blur-sm',
    
    // Card backgrounds
    cardPrimary: 'bg-white/85',
    cardSecondary: 'bg-sunflower-cream/50',
  },

  // ==========================================================================
  // SHADOWS
  // ==========================================================================
  shadows: {
    card: 'shadow-[0_12px_30px_rgba(99,49,18,0.15)]',
    button: 'shadow-md shadow-sunflower-gold/40',
    table: 'shadow-[0_10px_25px_rgba(99,49,18,0.15)]',
    light: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  },

  // ==========================================================================
  // SPACING & LAYOUT
  // ==========================================================================
  spacing: {
    nav: {
      height: '64px',
      padding: 'px-6 py-4',
    },
    sidebar: {
      width: '240px',
      padding: 'px-4 py-6',
    },
    content: {
      maxWidth: 'max-w-7xl',
      padding: 'px-6 py-8 md:px-10 md:py-10',
    },
  },

  // ==========================================================================
  // ANIMATIONS
  // ==========================================================================
  animations: {
    fadeIn: 'animate-in fade-in duration-300',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
    scaleIn: 'animate-in zoom-in-95 duration-200',
  },
};

// ==========================================================================
// FLORAL PLACEMENT CONFIGURATION
// ==========================================================================

export const floralPlacements = {
  // Case List Screen
  caseList: {
    hero: {
      image: 'single_sunflower_leaves.png',
      position: 'top-left',
      size: '400px',
      opacity: '0.30',
      className: 'absolute top-0 left-0 w-[400px] opacity-30 pointer-events-none select-none',
    },
    accent: {
      image: 'budding_sunflower.png',
      position: 'bottom-right',
      size: '200px',
      opacity: '0.25',
      className: 'absolute bottom-0 right-0 w-[200px] opacity-25 pointer-events-none select-none',
    },
    subtle: {
      image: 'stem and leaves.png',
      position: 'top-right',
      size: '150px',
      opacity: '0.15',
      className: 'absolute top-0 right-0 w-[150px] opacity-15 pointer-events-none select-none',
    },
  },

  // Case Detail Screen
  caseDetail: {
    hero: {
      image: 'corner_transparent_sunflowers.png',
      position: 'top-right',
      size: '350px',
      opacity: '0.35',
      className: 'absolute top-0 right-0 w-[350px] opacity-35 pointer-events-none select-none',
    },
    accent: {
      image: 'single_sunflower_no_stem.png',
      position: 'bottom-left',
      size: '250px',
      opacity: '0.20',
      className: 'absolute bottom-0 left-0 w-[250px] opacity-20 pointer-events-none select-none',
    },
    subtle: {
      image: 'stem and leaves_flipped.png',
      position: 'mid-left',
      size: '120px',
      opacity: '0.12',
      className: 'absolute top-1/2 left-0 -translate-y-1/2 w-[120px] opacity-12 pointer-events-none select-none',
    },
  },

  // Case Form Screen
  caseForm: {
    hero: {
      image: 'sunflowers_standing_stems.png',
      position: 'left',
      size: '300px',
      opacity: '0.28',
      className: 'absolute top-20 left-0 w-[300px] opacity-28 pointer-events-none select-none',
    },
    accent: {
      image: 'budding_sunflower.png',
      position: 'top-right',
      size: '180px',
      opacity: '0.22',
      className: 'absolute top-0 right-0 w-[180px] opacity-22 pointer-events-none select-none',
    },
  },

  // Modal Screens (Add Party/Policy/Contact)
  modal: {
    accent: {
      image: 'single_sunflower_no_stem.png',
      position: 'top-left',
      size: '200px',
      opacity: '0.25',
      className: 'absolute top-0 left-0 w-[200px] opacity-25 pointer-events-none select-none',
    },
    subtle: {
      image: 'stem and leaves.png',
      position: 'bottom-right',
      size: '100px',
      opacity: '0.15',
      className: 'absolute bottom-0 right-0 w-[100px] opacity-15 pointer-events-none select-none',
    },
  },

  // Contacts Tab (Phase 1B)
  contactsTab: {
    hero: {
      image: 'corner_transparent_sunflowers_top_flipped.png',
      position: 'top-left',
      size: '320px',
      opacity: '0.32',
      className: 'absolute top-0 left-0 w-[320px] opacity-32 pointer-events-none select-none',
    },
    accent: {
      image: 'single_sunflower_leaves.png',
      position: 'bottom-right',
      size: '220px',
      opacity: '0.18',
      className: 'absolute bottom-0 right-0 w-[220px] opacity-18 pointer-events-none select-none',
    },
  },

  // Global Navigation (Branding)
  globalNav: {
    icon: {
      image: 'single_sunflower_no_stem.png',
      size: '32px',
      opacity: '0.90',
      className: 'w-8 h-8 opacity-90',
    },
  },
};

// Helper function to get floral styles for a screen
export const getFloralStyles = (screenName: keyof typeof floralPlacements) => {
  return floralPlacements[screenName];
};

export default sunflowerTheme;

