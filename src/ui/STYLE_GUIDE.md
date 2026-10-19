# TOF — Styling guide

> Incrementele migratie van inline styles naar CSS Modules.

## Volgorde van waarheid

1. **Design tokens** (`src/ui/tokens.js`) — non-kleur waarden: SPACING, RADIUS, TYPE, SHADOW, MODULE accents.
2. **CSS variables** (`src/index.css`) — kleuren via `var(--tof-*)`.
3. **CSS Modules** (`<Component>.module.css`) — statische component-stijlen.
4. **Inline styles** — alléén voor dynamische waarden (animatie-state, runtime
   maten op basis van props).

## Patroon voor migratie

Voorbeeld in dit project: `Landing.jsx` + `Landing.module.css`.

```jsx
import styles from './Landing.module.css';

export default function Landing() {
  return <div className={styles.wrapper}>...</div>;
}
```

```css
/* Landing.module.css */
.wrapper {
  background: var(--tof-bg);
  padding: 24px;
}
```

## Wanneer wat gebruiken

| Type stijl                    | Waar plaatsen                       |
| ----------------------------- | ----------------------------------- |
| Layout, kleur, typografie     | `.module.css`                       |
| Hover/focus/active states     | `.module.css` (`:hover` etc.)       |
| Media queries / responsive    | `.module.css` (`@media`)            |
| Token-waarden                 | `var(--tof-*)` of `tokens.js`       |
| Runtime opacity/transform     | inline `style={{}}`                 |
| Dynamische maten (props)      | inline `style={{}}` of CSS variable |

## Migratie-volgorde aanbeveling

1. ✅ `Landing.jsx` — gedaan (referentie-implementatie)
2. `Intro.jsx` — kort, simpele structuur
3. `Login.jsx` — geïsoleerd
4. `Nav.jsx` — wordt op elke pagina geladen, snelle winst
5. `Quiz.jsx`
6. `Home.jsx`
7. `TeamSelector.jsx`
8. `TeamIntro.jsx`
9. `TeamDashboard.jsx`
10. `Library.jsx`
11. `Results.jsx`        ⚠️ groot — opsplitsen in sub-componenten eerst
12. `TeamDynamics.jsx`   ⚠️ groot — opsplitsen in sub-componenten eerst

## Naming convention

- Class-namen in `camelCase` (CSS Modules-stijl): `.logoButton`, `.titleAccent`
- Geen BEM, geen hardgecodeerde prefixes — module geeft scope
- Hou class-namen kort en semantisch: `.wrapper`, `.stage`, `.cta`
- Modifiers via aparte classes met `is`-prefix: `.cta.isLoading`
