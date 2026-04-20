export function isMobileScreen() {
    return window.innerWidth < 900;
}

export function getFirstName(name) {
    return name?.split(' ')[0] || '';
}