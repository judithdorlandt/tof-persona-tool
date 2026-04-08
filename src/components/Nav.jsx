export default function Nav({ page, setPage, hasResult = false }) {
    const baseItems = [
        { key: 'home', label: 'Home' },
        { key: 'intro', label: 'Eerst even uitleg' },
        { key: 'quiz', label: 'Test jezelf' },
    ];

    const resultItems = hasResult
        ? [
            { key: 'results', label: 'Resultaat' },
            { key: 'library', label: "Persona's" },
        ]
        : [];

    const items = [...baseItems, ...resultItems];

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 40px',
                borderBottom: '1px solid #e7e0d9',
                background: '#f7f2ec',
            }}
        >
            {/* LOGO */}
            <div
                style={{
                    fontFamily: 'Playfair Display',
                    fontSize: 22,
                }}
            >
                The Office <em style={{ color: '#b85c5c' }}>Factory</em>
            </div>

            {/* NAV ITEMS */}
            <div style={{ display: 'flex', gap: 12 }}>
                {items.map((item) => {
                    const active = page === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => setPage(item.key)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: 10,
                                border: active
                                    ? '1px solid #b85c5c'
                                    : '1px solid #d6cec6',
                                background: active ? '#b85c5c' : 'transparent',
                                color: active ? '#ffffff' : '#1a1a1a',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                boxShadow: active
                                    ? '0 4px 12px rgba(184, 92, 92, 0.18)'
                                    : 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}