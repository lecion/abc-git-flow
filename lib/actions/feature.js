"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const git_1 = require("../utils/git");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const startFeatureQuestions = [{
        type: 'input',
        name: 'featureName',
        message: '请填写需求名称，建议使用 TAPD 需求单 ID：',
        filter: (value) => value.trim(),
        validate: (value) => {
            const validate = value.trim().split(' ').length === 1;
            return validate || '需求名称不能有空格';
        },
        transformer: (value) => `feature/${value}`
    }];
const finishFeatureQuestions = [{
        type: 'input',
        name: 'featureName',
        message: '此操作将把 feature 分支合入 develop，请填写要结束的需求名称：',
        filter: (value) => value.trim(),
        validate: (value) => {
            const validate = value.trim().split(' ').length === 1;
            return validate || '需求名称不能有空格';
        },
        transformer: (value) => `feature/${value}`
    }];
async function start(featureName) {
    if (!featureName) {
        let answer = await inquirer_1.default.prompt(startFeatureQuestions);
        featureName = answer.featureName;
    }
    if (!featureName.startsWith('feature/')) {
        featureName = 'feature/' + featureName;
    }
    try {
        // 1.更新 develop 分支
        await git_1.Git.checkoutBranch('develop');
        await git_1.Git.pullWithRebase();
        // 2. 创建 feature 分支
        await git_1.Git.createBranchFrom(featureName, 'develop');
        await git_1.Git.checkoutBranch(featureName);
        console.log('feature 分支创建完成，当前所在分支 ->', chalk_1.default.yellowBright(featureName));
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`分支创建失败, ${e}`));
    }
}
exports.start = start;
async function finish(featureName) {
    const currentBranchName = await git_1.Git.getCurrentBranchName();
    if (!featureName) {
        // 先检查当前是否是 feature 分支
        if (currentBranchName.startsWith('feature/')) {
            let { use } = await inquirer_1.default.prompt([{
                    type: 'input',
                    name: 'use',
                    message: `是否 finish 当前 feature 分支: ${currentBranchName} (y/n)：`,
                    filter: (value) => value.trim(),
                }]);
            console.log('use', use);
            if (use === 'y' || use === 'Y') {
                featureName = currentBranchName;
            }
            else {
                let answer = await inquirer_1.default.prompt(finishFeatureQuestions);
                featureName = answer.featureName;
            }
        }
        else {
            let answer = await inquirer_1.default.prompt(finishFeatureQuestions);
            featureName = answer.featureName;
        }
    }
    if (!featureName.startsWith('feature/')) {
        featureName = 'feature/' + featureName;
    }
    try {
        if (currentBranchName !== 'develop') {
            git_1.Git.checkoutBranch('develop');
        }
        git_1.Git.pullWithRebase();
        // Git.mergeBranch(featureName, '--no-ff');
        await git_1.Git.mergeBranches('develop', featureName);
        console.info(chalk_1.default.greenBright(`需求【${featureName}】合入 develop 完成`));
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`需求【${featureName}】合入 develop 失败`));
    }
    const { confirm } = await inquirer_1.default.prompt([{
            type: 'input',
            name: 'confirm',
            message: `是否需要删除 feature 分支【${featureName}】？(y/n)`,
        }]);
    if (confirm === 'y' || confirm === 'Y') {
        try {
            await git_1.Git.deleteBranch(featureName);
        }
        catch (e) {
            console.error(chalk_1.default.redBright(`需求【${featureName}】删除失败：${e}`));
        }
    }
}
exports.finish = finish;
