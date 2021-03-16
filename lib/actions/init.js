"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
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
async function init() {
    try {
        const repository = await git_1.Git.discoverRepository();
        // 检查是否初始化
        const isInit = await git_1.Git.isInit(repository);
        if (isInit) {
            console.info(chalk_1.default.greenBright('abc-flow 已经初始化过了'));
        }
        else {
            const code = await git_1.Git.initFlow(repository);
            if (code > 0) {
                console.info(chalk_1.default.greenBright('abc-flow 初始化成功'));
            }
            else {
                console.error(chalk_1.default.redBright('abc-flow 初始化失败：', code));
            }
        }
    }
    catch (e) {
        console.error(chalk_1.default.redBright(`无法找到 git 仓库，请在工程目录下执行 init. \n${e.message}`));
    }
}
exports.init = init;
