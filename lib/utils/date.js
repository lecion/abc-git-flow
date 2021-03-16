"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YEAR_PATTERN = new RegExp('^(19|20)\\d{2}$');
function validateYear(year) {
    return YEAR_PATTERN.test(year);
}
exports.validateYear = validateYear;
function getYear() {
    return new Date().getFullYear() + '';
}
exports.getYear = getYear;
