import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';

/**
 * QuizAanmelding — Supabase-gedreven aanmeldformulier voor "Test jezelf".
 *
 * Upgrade op de vrije-tekst context-stap in Quiz.jsx: in plaats van
 * organisatie/afdeling/teamcode zelf te typen (typo-gevoelig, terwijl de
 * team-matching exact op invite_code draait), kiest de deelnemer hier zijn
 * team uit een dropdown en vult de teamcode zich automatisch.
 *
 * Bron = Supabase-tabel `team_access_codes` (active = true):
 *   - organization : organisatienaam
 *   - team         : afdeling / team
 *   - code         : automatisch gegenereerde toegangscode (invite_code)
 *
 * Props:
 *   - organisatie : optioneel. Vast-zetten op één organisatie. Leeg = de
 *                   deelnemer kiest zelf uit alle organisaties met codes.
 *   - onSubmit(profile) : ontvangt het profiel in saveResponse-vorm:
 *                   { name, org, dept, team, invite_code }
 */
export default function QuizAanmelding({ organisatie = '', onSubmit }) {
  const orgVast = String(organisatie || '').trim();

  const [rijen, setRijen] = useState([]); // [{ organization, team, code }]
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState('');

  const [form, setForm] = useState({
    organisatie: orgVast,
    afdeling: '',
    teamcode: '',
    voornaam: '',
    team: '',
    overJezelf: '',
  });

  // Actieve team-codes ophalen uit Supabase.
  useEffect(() => {
    let actief = true;
    async function haalCodes() {
      setLaden(true);
      setFout('');

      if (!supabase) {
        if (actief) {
          setFout('Verbinding met de database is niet beschikbaar.');
          setRijen([]);
          setLaden(false);
        }
        return;
      }

      let query = supabase
        .from('team_access_codes')
        .select('organization, team, code')
        .eq('active', true)
        .order('organization', { ascending: true })
        .order('team', { ascending: true });

      if (orgVast) query = query.eq('organization', orgVast);

      const { data, error } = await query;
      if (!actief) return;

      if (error) {
        setFout('Kon de teams niet laden. Probeer het later opnieuw.');
        setRijen([]);
      } else {
        setRijen(
          (data || [])
            .map((r) => ({
              organization: String(r.organization || '').trim(),
              team: String(r.team || '').trim(),
              code: String(r.code || '').trim(),
            }))
            .filter((r) => r.team && r.code)
        );
      }
      setLaden(false);
    }
    haalCodes();
    return () => {
      actief = false;
    };
  }, [orgVast]);

  // Unieke organisaties (alleen relevant als er geen vaste organisatie is).
  const organisaties = useMemo(() => {
    const set = new Set(rijen.map((r) => r.organization).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, 'nl'));
  }, [rijen]);

  // Afdelingen binnen de gekozen organisatie.
  const afdelingen = useMemo(() => {
    const org = form.organisatie;
    if (!org) return [];
    return rijen.filter((r) => r.organization === org);
  }, [rijen, form.organisatie]);

  function kiesOrganisatie(e) {
    const org = e.target.value;
    setForm((f) => ({ ...f, organisatie: org, afdeling: '', teamcode: '' }));
  }

  // Bij keuze afdeling: bijbehorende teamcode automatisch invullen.
  function kiesAfdeling(e) {
    const naam = e.target.value;
    const gekozen = afdelingen.find((a) => a.team === naam);
    setForm((f) => ({
      ...f,
      afdeling: naam,
      teamcode: gekozen ? gekozen.code : '',
    }));
  }

  function wijzig(veld) {
    return (e) => setForm((f) => ({ ...f, [veld]: e.target.value }));
  }

  function verstuur(e) {
    e.preventDefault();
    if (!form.organisatie) {
      setFout('Kies eerst een organisatie.');
      return;
    }
    if (!form.afdeling) {
      setFout('Kies eerst een afdeling.');
      return;
    }
    setFout('');

    const profile = {
      name: form.voornaam.trim(),
      org: form.organisatie,
      dept: form.afdeling,
      // Team is optioneel; valt terug op de afdeling als leeg.
      team: form.team.trim() || form.afdeling,
      invite_code: form.teamcode,
      role: form.overJezelf.trim(),
    };

    if (typeof onSubmit === 'function') {
      onSubmit(profile);
    } else {
      // Geen handler aangesloten — log voor ontwikkeldoeleinden.
      console.log('Aanmelding:', profile);
    }
  }

  // ── Styling — inline, in lijn met Quiz.jsx / Intro (TOF-palet) ──────────
  const S = {
    page: {
      minHeight: 'calc(100vh - 88px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '24px 20px 40px',
      background: '#f7f2ec',
      boxSizing: 'border-box',
    },
    card: {
      width: '100%',
      maxWidth: 560,
      background: 'white',
      borderRadius: 20,
      borderTop: '4px solid #b85c5c',
      border: '1px solid #ddd6ce',
      boxShadow: '0 12px 32px rgba(31,27,24,0.08)',
      padding: '28px 28px 32px',
    },
    eyebrow: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      fontWeight: 600,
      color: '#b85c5c',
      marginBottom: 6,
    },
    title: {
      fontFamily: 'Playfair Display',
      fontSize: 26,
      lineHeight: 1.2,
      margin: '0 0 18px 0',
      color: '#1f1b18',
      fontWeight: 500,
    },
    label: {
      display: 'block',
      fontWeight: 600,
      marginTop: 16,
      marginBottom: 6,
      color: '#3f3833',
      fontSize: 14,
    },
    optional: { fontWeight: 400, color: '#a89e96', fontSize: 13 },
    required: { color: '#b85c5c' },
    input: {
      width: '100%',
      padding: '11px 14px',
      border: '1px solid #ddd',
      borderRadius: 12,
      fontSize: 15,
      color: '#1f1b18',
      background: 'white',
      boxSizing: 'border-box',
      outline: 'none',
    },
    readonly: {
      width: '100%',
      padding: '11px 14px',
      border: '1px solid #e6dfd8',
      borderRadius: 12,
      fontSize: 15,
      background: '#f4efe9',
      color: '#7a6d66',
      boxSizing: 'border-box',
    },
    hint: { fontSize: 13, color: '#8a7f78', marginTop: 6 },
    error: { fontSize: 14, color: '#b85c5c', marginTop: 12 },
    submit: {
      marginTop: 24,
      width: '100%',
      padding: '13px 22px',
      background: '#1f1b18',
      color: 'white',
      fontSize: 15,
      fontWeight: 600,
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(31,27,24,0.18)',
    },
  };

  return (
    <div className="fade-up" style={S.page}>
      <form onSubmit={verstuur} style={S.card}>
        <div style={S.eyebrow}>Test jezelf — aanmelden</div>
        <h1 style={S.title}>Kies je team</h1>

        {/* Organisatie — vast óf keuze */}
        <label style={S.label}>
          Organisatie <span style={S.required}>*</span>
        </label>
        {orgVast ? (
          <input style={S.readonly} value={orgVast} readOnly />
        ) : (
          <select
            style={S.input}
            value={form.organisatie}
            onChange={kiesOrganisatie}
            required
            disabled={laden}
          >
            <option value="" disabled>
              {laden ? 'Organisaties laden…' : 'Kies je organisatie…'}
            </option>
            {organisaties.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        )}

        {/* Afdeling — dropdown uit Supabase */}
        <label style={S.label}>
          Afdeling <span style={S.required}>*</span>
        </label>
        <select
          style={S.input}
          value={form.afdeling}
          onChange={kiesAfdeling}
          required
          disabled={laden || !form.organisatie}
        >
          <option value="" disabled>
            {laden
              ? 'Afdelingen laden…'
              : !form.organisatie
              ? 'Kies eerst een organisatie…'
              : afdelingen.length === 0
              ? 'Geen teams gevonden'
              : 'Kies je afdeling…'}
          </option>
          {afdelingen.map((a) => (
            <option key={a.code} value={a.team}>
              {a.team}
            </option>
          ))}
        </select>

        {/* Teamcode — automatisch ingevuld */}
        <label style={S.label}>Teamcode</label>
        <input
          style={S.readonly}
          value={form.teamcode}
          placeholder="Verschijnt na keuze afdeling"
          readOnly
        />
        <p style={S.hint}>Wordt automatisch ingevuld zodra je een afdeling kiest.</p>

        {/* Optionele velden */}
        <label style={S.label}>
          Voornaam <span style={S.optional}>(optioneel)</span>
        </label>
        <input style={S.input} value={form.voornaam} onChange={wijzig('voornaam')} placeholder="Hoe heet je?" />

        <label style={S.label}>
          Team <span style={S.optional}>(optioneel)</span>
        </label>
        <input
          style={S.input}
          value={form.team}
          onChange={wijzig('team')}
          placeholder="Laat leeg als je afdeling één team is"
        />

        <label style={S.label}>
          Meer over jezelf <span style={S.optional}>(optioneel)</span>
        </label>
        <textarea
          style={{ ...S.input, minHeight: 96, resize: 'vertical', fontFamily: 'inherit' }}
          value={form.overJezelf}
          onChange={wijzig('overJezelf')}
        />

        {fout && <p style={S.error}>{fout}</p>}

        <button type="submit" style={S.submit}>
          Verder naar de quiz →
        </button>
      </form>
    </div>
  );
}
