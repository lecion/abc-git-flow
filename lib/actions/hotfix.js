"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const git_1 = require("../utils/git");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const HotfixG = tslib_1.__importStar(require("./hotfix-g"));
const startQuestions = [{
        type: 'input',
        name: 'hotfixName',
        message: '请填写正式环境的 Hotfix 名称，建议使用 BUG 单 ID：',
        filter: (value) => value.trim(),
        validate: (value) => {
            const validate = value.trim().split(' ').length === 1;
            return validate || 'Hotfix 名称不能有空格';
        },
        transformer: (value) => `hotfix/${value}`
    }];
const finishQuestions = [{
        type: 'input',
        name: 'hotfixName',
        message: '此操作将把 Hotfix 分支合入 master 分支，请填写要结束的 Hotfix 分支名称：',
        filter: (value) => value.trim(),
        validate: (value) => {
            const validate = value.trim().split(' ').length === 1;
            return validate || 'Hotfix 名称不能有空格';
        },
        transformer: (value) => `hotfix/${value}`
    }];
async function start(hotfixName) {
    if (!hotfixName) {
        let answer = await inquirer_1.default.prompt(startQuestions);
        hotfixName = answer.hotfixName;
    }
    if (!hotfixName.startsWith('hotfix/')) {
        hotfixName = 'hotfix/' + hotfixName;
    }
    console.log('即将拉取正式环境的 hotfix 分支 ->', chalk_1.default.yellowBright(hotfixName));
    try {
        // 1.更新 master 分支
        await git_1.Git.checkoutBranch('master');
        await git_1.Git.pullWithRebase();
        // 2. 创建 hotfix 分支
        await git_1.Git.createBranchFrom(hotfixName, 'master');
        await git_1.Git.checkoutBranch(hotfixName);
        console.log('hotfix 分支创建完成，当前所在分支 ->', chalk_1.default.yellowBright(hotfixName));
    }
    catch (e) {
        console.error(chalk_1.default.redBright('hotfix 分支创建失败'));
    }
}
exports.start = start;
async function finish(hotfixName) {
    const currentBranchName = await git_1.Git.getCurrentBranchName();
    if (!hotfixName) {
        // 先检查当前是否是 hotfix 分支
        if (currentBranchName.startsWith('hotfix/')) {
            let { use } = await inquirer_1.default.prompt([{
                    type: 'input',
                    name: 'use',
                    message: `是否 finish 当前 hotfix 分支: ${currentBranchName} (y/n)：`,
                    filter: (value) => value.trim(),
                }]);
            console.log('use', use);
            if (use === 'y' || use === 'Y') {
                hotfixName = currentBranchName;
            }
            else {
                let answer = await inquirer_1.default.prompt(finishQuestions);
                hotfixName = answer.hotfixName;
            }
        }
        else {
            let answer = await inquirer_1.default.prompt(finishQuestions);
            hotfixName = answer.hotfixName;
        }
    }
    if (!hotfixName.startsWith('hotfix/')) {
        hotfixName = 'hotfix/' + hotfixName;
    }
    try {
        // 1. 更新 master 分支
        await git_1.Git.checkoutBranch('master');
        await git_1.Git.pullWithRebase();
        // 2. 合入 master 分支
        await git_1.Git.mergeBranches('master', hotfixName);
        console.info(chalk_1.default.green(`正式环境的 hotfix 分支【${hotfixName}】合入 master 完成`));
        // 3. 从 gray 拉 hotfix
        const hotfixGForMerge = `hotfix-g/${hotfixName}`;
        await HotfixG.start(hotfixGForMerge);
        try {
            // 4. 将 master 合入 hotfix-g
            await git_1.Git.mergeBranches(hotfixGForMerge, 'master');
            await HotfixG.finish(hotfixGForMerge);
            console.info(chalk_1.default.green(`正式环境的 hotfix 分支【${hotfixName}】合入 gray 完成，请手动 push [master/gray/rc/develop] 的代码`));
            const { confirm } = await inquirer_1.default.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: `是否需要删除 hotfix 分支【${hotfixName}】？(y/n)`,
                }]);
            if (confirm === 'y' || confirm === 'Y') {
                try {
                    await git_1.Git.deleteBranch(hotfixName);
                }
                catch (e) {
                    console.error(chalk_1.default.redBright(`hotfix【${hotfixName}】删除失败：${e}`));
                }
            }
        }
        catch (e) {
            // 如果出现冲突，需要解决
            console.error(chalk_1.default.green(`正式环境的 hotfix 分支【${hotfixName}】合入 gray 失败: ${e}`));
        }
    }
    catch (e) {
        console.error('hotfix finish 失败', e);
    }
}
exports.finish = finish;
