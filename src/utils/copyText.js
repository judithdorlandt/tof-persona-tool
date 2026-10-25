// Kopiëren met een terugval: navigator.clipboard kan weigeren (geen https,
// oudere browser, geen toestemming). Dan via een tijdelijk tekstveld.
// Gedeeld door het wachtscherm (TeamGate) en de deelmomenten (ShareNote).
export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_e) {
        try {
            const area = document.createElement('textarea');
            area.value = text;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(area);
            return ok;
        } catch (_e2) {
            return false;
        }
    }
}
