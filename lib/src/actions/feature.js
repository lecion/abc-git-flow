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
    const currentBranchName = git_1.Git.getCurrentBranchName();
    console.log('当前分支 ->', chalk_1.default.blueBright(currentBranchName));
    console.log('即将拉取分支 ->', chalk_1.default.yellowBright(featureName));
    try {
        git_1.Git.newBranch(featureName);
        console.log('分支创建完成，当前所在分支 ->', chalk_1.default.yellowBright(featureName));
    }
    catch (e) {
        console.error(chalk_1.default.redBright('分支创建失败'));
    }
    // console.log(res);
}
exports.start = start;
async function finish(featureName) {
    if (!featureName) {
        let answer = await inquirer_1.default.prompt(startFeatureQuestions);
        featureName = answer.featureName;
    }
    if (!featureName.startsWith('feature/')) {
        featureName = 'feature/' + featureName;
    }
    const currentBranchName = git_1.Git.getCurrentBranchName();
    if (currentBranchName !== 'develop') {
        git_1.Git.checkBranch('develop');
    }
    git_1.Git.pullWithRebase();
    git_1.Git.mergeBranch(featureName, '--no-ff');
    console.info(chalk_1.default.green(`需求【${featureName}】合入 develop 完成`));
}
exports.finish = finish;
