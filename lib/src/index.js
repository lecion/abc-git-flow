"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const commander_1 = tslib_1.__importDefault(require("commander"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const Feature = tslib_1.__importStar(require("./actions/feature"));
const Init = tslib_1.__importStar(require("./actions/init"));
commander_1.default
    .version("0.0.1", '-v, --version')
    .description('ABC GIT FLOW 工作流，用法：git abc commands');
commander_1.default
    .command('init', '初始化 Git 仓库，以支持 abc-flow') //'合入 develop，完成新特性的开发'
    .action(() => {
    Init.init();
});
commander_1.default
    .command('feature [op] [featureName]')
    .description('管理特性分支') //基于 develop 拉取特性分支，开发新特性
    .action((op, featureName, cmd) => {
    if (op === 'start') {
        Feature.start(featureName);
    }
    else if (op === 'finish') {
        Feature.finish(featureName);
    }
    else {
        console.error(chalk_1.default.red(`未知操作 ${op}`, 'op 只能是 [start, finish]'));
    }
});
commander_1.default
    .command('rc', '管理 rc 分支') //'合入 develop，完成新特性的开发'
    .action(() => {
});
commander_1.default
    .command('gray', '管理 gray 分支')
    .action(() => {
});
commander_1.default
    .command('hotfix', '管理 正式环境的 hotfix 分支')
    .action(() => {
});
commander_1.default
    .command('hotfix-g', '管理 灰度环境的 hotfix 分支')
    .action(() => {
});
// commander.help((msg) => {
//     // console.log(
//     //     chalk.red(
//     //         figlet.textSync('ABC GIT FLOW', {
//     //             horizontalLayout: 'full'
//     //         })
//     //     )
//     // );
//     return msg;
// })
commander_1.default.parse(process.argv);
