import React from 'react';

export default function Nav({ page, setPage, hasResult = false }) {
  const isMobile = window.innerWidth < 900;

  const navItems = [
    { key: 'home', label: 'Home' },
    ...(hasResult ? [{ key: 'library', label: "Persona's" }] : []),
    { key: 'intro', label: 'Test jezelf' },
  ];

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(247, 242, 236, 0.92)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: isMobile ? '14px 14px' : '18px 22px',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setPage('home')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 28 : 32,
              lineHeight: 1,
              color: 'var(--dark)',
              whiteSpace: 'nowrap',
            }}
          >
            The Office <span style={{ color: 'var(--rose)', fontStyle: 'italic' }}>Factory</span>
          </div>
        </button>

        <nav
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'flex-start' : 'flex-end',
          }}
        >
          {navItems.map((item) => {
            const isActive = page === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  background: isActive ? 'var(--rose)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--dark)',
                  border: `1px solid ${isActive ? 'var(--rose)' : 'var(--border)'}`,
                  padding: isMobile ? '11px 16px' : '12px 20px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  fontSize: 15,
                  fontWeight: 500,
                  boxShadow: isActive ? '0 0 0 2px rgba(66, 133, 244, 0.9)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'var(--rose-lt)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}