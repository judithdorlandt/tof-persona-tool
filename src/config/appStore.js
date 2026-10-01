/**
 * appStore.js — staat de app in de App Store?
 *
 * Eén vlag, want er hangt meer aan dan een zinnetje. Zodra de app te
 * downloaden is, is de app de plek waar je de test doet en gaat de webquiz
 * dicht: "Test jezelf" verdwijnt uit het menu, /quiz wordt een pagina die naar
 * de app wijst, en de welkomstmail voor een nieuw team stuurt mensen naar de
 * store in plaats van naar een formulier in de browser.
 *
 * Zolang hij op false staat verandert er niets: de webquiz is dan nog de enige
 * manier om de test te doen, en die mag niet dicht voordat er iets te
 * downloaden is.
 *
 * Bij publicatie: zet deze op true. Verder is er niets te zoeken.
 */
export const APP_IN_STORE = false;

/**
 * Kan je de test nog in de browser doen? Alleen zolang de app er niet is.
 * In de app zelf is dit niet van toepassing — die heeft zijn eigen quiz.
 */
export const WEB_QUIZ_OPEN = !APP_IN_STORE;
