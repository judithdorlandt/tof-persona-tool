import React from 'react';

export default function Team({ setPage }) {
    return (
        <div style={{ padding: 40 }}>
            <h1>TEAM WERKT</h1>
            <button onClick={() => setPage('home')}>Terug</button>
        </div>
    );
}