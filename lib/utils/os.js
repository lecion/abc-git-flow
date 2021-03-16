"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function copyToClipboard(content) {
    child_process_1.execSync(`echo ${content} | pbcopy`);
}
exports.copyToClipboard = copyToClipboard;
