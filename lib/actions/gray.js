"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const git_1 = require("../utils/git");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const startQuestions = [{
        type: 'input',
        name: 'confirm',
        message: '此操作将会把 gray 合入 master 分支，是否确认？(y/n)',
    }];
async function publish() {
    let { confirm } = await inquirer_1.default.prompt(startQuestions);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            // 1. checkout develop 并更新
            git_1.Git.checkoutBranch('gray');
            git_1.Git.pullWithRebase();
            // 2. checkout rc 并更新
            git_1.Git.checkoutBranch('master');
            git_1.Git.pullWithRebase();
            // 3. merge
            await git_1.Git.mergeBranches('master', 'gray');
            console.info(chalk_1.default.greenBright('合并 gray 到 master 分支成功，请手动 push 代码'));
        }
        catch (e) {
            console.error(chalk_1.default.redBright('合并 gray 到 master 分支失败'));
        }
    }
}
exports.publish = publish;
