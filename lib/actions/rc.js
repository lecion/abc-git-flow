"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const git_1 = require("../utils/git");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const startQuestions = [{
        type: 'input',
        name: 'confirm',
        message: '此操作将会把 develop 合入 rc 分支，是否确认？(y/n)',
    }];
const finishQuestions = [{
        type: 'input',
        name: 'confirm',
        message: '此操作将会把 rc 合入 gray/develop 分支，是否确认？(y/n)',
    }];
async function start() {
    let { confirm } = await inquirer_1.default.prompt(startQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout develop 并更新
            git_1.Git.checkoutBranch('develop');
            git_1.Git.pullWithRebase();
            // 2. checkout rc 并更新
            git_1.Git.checkoutBranch('rc');
            git_1.Git.pullWithRebase();
            // 3. merge
            await git_1.Git.mergeBranches('rc', 'develop');
            console.info(chalk_1.default.greenBright('合并 develop 到 rc 分支成功，请手动 push 代码'));
        }
        catch (e) {
            console.error(chalk_1.default.redBright('合并 develop 到 rc 分支失败'));
        }
    }
}
exports.start = start;
async function finish() {
    let { confirm } = await inquirer_1.default.prompt(finishQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout rc 并更新
            git_1.Git.checkoutBranch('rc');
            git_1.Git.pullWithRebase();
            // 2. checkout gray 并更新
            git_1.Git.checkoutBranch('gray');
            git_1.Git.pullWithRebase();
            // 3. merge
            await git_1.Git.mergeBranches('gray', 'rc');
            // 4. 将 rc 合回 develop
            await git_1.Git.mergeBranches('develop', 'rc', true);
            console.info(chalk_1.default.greenBright('合并 rc 到 gray/develop 分支成功，请手动 push 代码'));
        }
        catch (e) {
            console.error(chalk_1.default.redBright('合并 rc 到 gray/develop 分支失败'));
        }
    }
}
exports.finish = finish;
