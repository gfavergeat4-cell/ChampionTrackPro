import React from 'react';

interface UnifiedAthleteNavigationProps {
  activeTab: 'Home' | 'Schedule' | 'Profile';
  onNavigate: (tab: 'Home' | 'Schedule' | 'Profile') => void;
}

export default function UnifiedAthleteNavigation({ activeTab, onNavigate }: UnifiedAthleteNavigationProps) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: 'home' },
    { id: 'Schedule', label: 'Schedule', icon: 'calendar' },
    { id: 'Profile', label: 'Profile', icon: 'profile' }
  ];

  const getIcon = (iconName: string, isActive: boolean) => {
    const size = 20;
    const color = isActive ? '#00E0FF' : '#9CA3AF';
    
    switch (iconName) {
      case 'home':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22v-10h6v10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'calendar':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'profile':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '375px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      padding: '12px 20px 20px 20px',
      zIndex: 1000,
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id as 'Home' | 'Schedule' | 'Profile')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                color: isActive ? '#00E0FF' : '#9CA3AF',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#9CA3AF';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                filter: isActive ? 'drop-shadow(0 0 10px rgba(0, 224, 255, 0.8))' : 'none',
              }}>
                {getIcon(tab.icon, isActive)}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: isActive ? '#00E0FF' : '#9CA3AF',
              }}>
                {tab.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  height: '4px',
                  width: '32px',
                  backgroundColor: '#00E0FF',
                  borderRadius: '9999px',
                  filter: 'drop-shadow(0 0 10px rgba(0, 224, 255, 0.8))',
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
