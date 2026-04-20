export function buildTeamInsights(aggregate) {
    const dominantPersona = aggregate?.sortedPersonas?.[0];
    const secondPersona = aggregate?.sortedPersonas?.[1];
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const secondNeed = aggregate?.sortedWorkplaceNeeds?.[1];

    const highlights = [];
    const quickWins = [];

    if (dominantPersona) {
        highlights.push(
            `${dominantPersona.name} is de meest aanwezige werkstijl in dit team en zet waarschijnlijk de toon in tempo, voorkeuren en samenwerking.`
        );
    }

    if (dominantPersona && secondPersona) {
        highlights.push(
            `De combinatie van ${dominantPersona.name} en ${secondPersona.name} laat zien waar kracht én spanning kunnen ontstaan in afstemming, besluitvorming en ritme.`
        );
    }

    if (topNeed && secondNeed) {
        highlights.push(
            `De sterkste werkplekbehoefte ligt bij ${topNeed.key} en ${secondNeed.key}. Dat vraagt om bewuste keuzes in focus, overleg en samenwerking.`
        );
    }

    quickWins.push('Maak expliciete afspraken over wanneer het team focust en wanneer het samenkomt.');
    quickWins.push('Bespreek verschillen in werkstijl open, zonder ze direct te problematiseren.');
    quickWins.push('Gebruik het dashboard als startpunt voor betere werkplek- en samenwerkingsafspraken.');

    return {
        highlights,
        quickWins,
    };
}