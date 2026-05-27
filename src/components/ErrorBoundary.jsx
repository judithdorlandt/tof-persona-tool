/**
 * ErrorBoundary — vangt onverwachte fouten af in de child-tree
 * en toont een rustige, premium fallback i.p.v. een witte pagina.
 *
 * Behoudt zoveel mogelijk context (lokaal opgeslagen quiz-progress
 * blijft staan) en geeft de gebruiker één duidelijke uitweg: reload.
 */
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Console — opvangen in monitoring later. Niet doorgooien.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReload = () => {
    try {
      // Soft reload: hash route blijft staan, state reset.
      window.location.reload();
    } catch (e) {
      // niets — als reload faalt, dan is browser stuk
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const wrap = {
      minHeight: '100vh',
      background: 'var(--tof-bg, #F7F3EE)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      boxSizing: 'border-box',
      fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    };
    const card = {
      maxWidth: 560,
      background: '#fff',
      border: '1px solid #E6DDD2',
      borderRadius: 18,
      boxShadow: '0 10px 26px rgba(31,31,31,0.05)',
      padding: '40px 36px 32px',
      textAlign: 'left',
    };
    const eye = {
      fontSize: 11,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      color: '#7A7A7A',
      fontWeight: 700,
      marginBottom: 14,
    };
    const title = {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: 'clamp(24px, 3.4vw, 34px)',
      lineHeight: 1.12,
      color: '#1F1F1F',
      margin: '0 0 12px',
    };
    const body = {
      fontSize: 15,
      lineHeight: 1.7,
      color: '#555',
      margin: '0 0 22px',
    };
    const actions = {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      alignItems: 'center',
    };
    const primary = {
      background: '#B05252',
      color: '#fff',
      border: 'none',
      padding: '12px 22px',
      borderRadius: 999,
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      letterSpacing: '0.02em',
    };
    const mailLink = {
      color: '#B05252',
      textDecoration: 'none',
      fontSize: 14,
      borderBottom: '1px solid transparent',
      transition: 'border-color 0.2s ease',
    };

    return (
      <div style={wrap}>
        <div style={card}>
          <div style={eye}>Er ging iets mis</div>
          <h1 style={title}>
            Even pauze.
            <br />
            <em style={{ color: '#B05252', fontStyle: 'italic' }}>
              We pakken het op.
            </em>
          </h1>
          <p style={body}>
            Een onderdeel van de app reageerde niet zoals verwacht. Je
            antwoorden tot nu toe zijn lokaal bewaard — laad de pagina
            opnieuw om verder te gaan. Lukt het daarna nog niet, dan
            help ik graag persoonlijk.
          </p>
          <div style={actions}>
            <button type="button" style={primary} onClick={this.handleReload}>
              Pagina opnieuw laden
            </button>
            <a
              href="mailto:judith@tof.services?subject=Foutmelding%20Persona%20Tool"
              style={mailLink}
              onMouseOver={(e) => {
                e.currentTarget.style.borderBottomColor = '#B05252';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderBottomColor = 'transparent';
              }}
            >
              Stuur Judith een bericht →
            </a>
          </div>
        </div>
      </div>
    );
  }
}
