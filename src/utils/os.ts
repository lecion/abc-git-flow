import {execSync} from "child_process";

export function copyToClipboard(content: string) {
    execSync(`echo ${content} | pbcopy`);
}
