import { useState } from 'react';
import { saveFeedback } from '../supabase';

export default function Feedback({ primaryPersonaName = '' }) {
    const [fit, setFit] = useState('');
    const [reason, setReason] = useState('');
    const [teamUse, setTeamUse] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const showReason = !!fit;
    const showTeamUse = fit === 'spot_on' || fit === 'recognizable';
    const showEmail = teamUse === 'yes' || teamUse === 'maybe';

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSaving(true);

        try {
            await saveFeedback({
                primary_persona_name: primaryPersonaName,
                fit,
                reason,
                team_use: teamUse,
                email,
            });

            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError('Er ging iets mis bij opslaan.');
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return <div>✅ Dank je! Feedback opgeslagen.</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <h3>Klopt dit voor jou?</h3>

            <button type="button" onClick={() => setFit('spot_on')}>Spot on</button>
            <button type="button" onClick={() => setFit('recognizable')}>Herkenbaar</button>
            <button type="button" onClick={() => setFit('doubt')}>Twijfel</button>
            <button type="button" onClick={() => setFit('not_really')}>Niet echt</button>

            {showReason && (
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Waarom?"
                />
            )}

            {showTeamUse && (
                <>
                    <button type="button" onClick={() => setTeamUse('yes')}>Ja</button>
                    <button type="button" onClick={() => setTeamUse('maybe')}>Misschien</button>
                    <button type="button" onClick={() => setTeamUse('no')}>Nee</button>
                </>
            )}

            {showEmail && (
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                />
            )}

            {error && <div style={{ color: 'red' }}>{error}</div>}

            <button type="submit" disabled={!fit || saving}>
                {saving ? 'Opslaan...' : 'Verstuur'}
            </button>
        </form>
    );
}