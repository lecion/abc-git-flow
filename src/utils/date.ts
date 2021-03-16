const YEAR_PATTERN = new RegExp('^(19|20)\\d{2}$');
export function validateYear(year: string) {
    return YEAR_PATTERN.test(year);
}

export function getYear() {
    return new Date().getFullYear() + '';
}
